import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

/**
 * Field-level encryption for sensitive medical data (Option B).
 *
 * Plaintext is encrypted with AES-256-GCM in the Next.js server runtime BEFORE
 * it ever reaches Supabase, so the database (and the Supabase dashboard) only
 * ever sees ciphertext. Each value is stored as a single self-describing string:
 *
 *     v<keyVersion>:<ivBase64>:<authTagBase64>:<ciphertextBase64>
 *
 * Key versioning lets us rotate keys without losing access to old data: new
 * rows are written with ENCRYPTION_KEY_CURRENT_VERSION, while older versioned
 * keys remain available for decryption.
 *
 * Keys are 32 random bytes, base64-encoded, supplied via environment variables:
 *     ENCRYPTION_KEY_CURRENT_VERSION=1
 *     ENCRYPTION_KEY_V1=<base64 of 32 random bytes>
 *     ENCRYPTION_KEY_V2=<...>   # added when rotating
 */

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12; // 96-bit nonce, recommended for GCM
const KEY_BYTES = 32; // AES-256
const PREFIX = "v";

type KeyMap = Map<number, Buffer>;

let cachedKeys: KeyMap | null = null;
let cachedCurrentVersion: number | null = null;

function loadKeys(): { keys: KeyMap; currentVersion: number } {
  if (cachedKeys && cachedCurrentVersion !== null) {
    return { keys: cachedKeys, currentVersion: cachedCurrentVersion };
  }

  const currentVersionRaw = process.env.ENCRYPTION_KEY_CURRENT_VERSION;
  if (!currentVersionRaw) {
    throw new Error(
      "ENCRYPTION_KEY_CURRENT_VERSION is not set. Configure encryption keys before handling sensitive data.",
    );
  }

  const currentVersion = Number.parseInt(currentVersionRaw, 10);
  if (!Number.isInteger(currentVersion) || currentVersion < 1) {
    throw new Error(
      `Invalid ENCRYPTION_KEY_CURRENT_VERSION: "${currentVersionRaw}" (expected a positive integer).`,
    );
  }

  const keys: KeyMap = new Map();
  for (const [name, value] of Object.entries(process.env)) {
    const match = /^ENCRYPTION_KEY_V(\d+)$/.exec(name);
    if (!match || !value) continue;

    const version = Number.parseInt(match[1], 10);
    const key = Buffer.from(value, "base64");
    if (key.length !== KEY_BYTES) {
      throw new Error(
        `${name} must decode to ${KEY_BYTES} bytes (got ${key.length}). Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`,
      );
    }
    keys.set(version, key);
  }

  if (!keys.has(currentVersion)) {
    throw new Error(
      `Missing ENCRYPTION_KEY_V${currentVersion} for the current key version.`,
    );
  }

  cachedKeys = keys;
  cachedCurrentVersion = currentVersion;
  return { keys, currentVersion };
}

/** For tests: clear the in-memory key cache so env changes are picked up. */
export function resetEncryptionKeyCache(): void {
  cachedKeys = null;
  cachedCurrentVersion = null;
}

/**
 * Encrypt a plaintext string. Returns null for null/undefined input so callers
 * can pass nullable columns straight through.
 */
export function encryptField(plaintext: string | null | undefined): string | null {
  if (plaintext === null || plaintext === undefined) return null;

  const { keys, currentVersion } = loadKeys();
  const key = keys.get(currentVersion)!;
  const iv = randomBytes(IV_BYTES);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    `${PREFIX}${currentVersion}`,
    iv.toString("base64"),
    authTag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

/**
 * Decrypt a packed ciphertext string produced by {@link encryptField}.
 * Returns null for null/undefined input.
 */
export function decryptField(packed: string | null | undefined): string | null {
  if (packed === null || packed === undefined) return null;

  const parts = packed.split(":");
  if (parts.length !== 4) {
    throw new Error("Malformed encrypted value: expected 4 colon-separated parts.");
  }

  const [versionPart, ivB64, tagB64, ctB64] = parts;
  if (!versionPart.startsWith(PREFIX)) {
    throw new Error("Malformed encrypted value: missing version prefix.");
  }

  const version = Number.parseInt(versionPart.slice(PREFIX.length), 10);
  const { keys } = loadKeys();
  const key = keys.get(version);
  if (!key) {
    throw new Error(
      `No decryption key available for version ${version}. Was ENCRYPTION_KEY_V${version} removed?`,
    );
  }

  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return plaintext.toString("utf8");
}

/** Returns true if a string looks like one of our packed ciphertext values. */
export function isEncrypted(value: string | null | undefined): boolean {
  if (!value) return false;
  const parts = value.split(":");
  return parts.length === 4 && /^v\d+$/.test(parts[0]);
}

/**
 * Encrypt the named fields of an object, returning a shallow copy. Useful right
 * before an insert/update to Supabase.
 */
export function encryptFields<T extends Record<string, unknown>>(
  row: T,
  fields: readonly (keyof T)[],
): T {
  const out = { ...row };
  for (const field of fields) {
    const value = out[field];
    if (typeof value === "string" || value === null || value === undefined) {
      out[field] = encryptField(value as string | null | undefined) as T[keyof T];
    }
  }
  return out;
}

/** Decrypt the named fields of an object, returning a shallow copy. */
export function decryptFields<T extends Record<string, unknown>>(
  row: T,
  fields: readonly (keyof T)[],
): T {
  const out = { ...row };
  for (const field of fields) {
    const value = out[field];
    if (typeof value === "string") {
      out[field] = decryptField(value) as T[keyof T];
    }
  }
  return out;
}

/** Constant-time string comparison helper (e.g. for token checks). */
export function safeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
