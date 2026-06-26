/**
 * Single source of truth for which columns hold app-level encrypted ciphertext.
 * Server data-access helpers use this to encrypt before writes and decrypt
 * after reads. Keep this in sync with the 🔒 columns in the SQL migrations.
 */
export const ENCRYPTED_FIELDS = {
  patients: ["contact_info"],
  cases: ["diagnosis", "treatment_plan"],
  reviews: ["notes"],
} as const;

export type EncryptedTable = keyof typeof ENCRYPTED_FIELDS;
