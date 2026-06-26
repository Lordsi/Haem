import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required (set in .env.local).");
  process.exit(1);
}

const migrationsDir = join(root, "supabase", "migrations");
const migrationFiles = readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function ensureMigrationsTable() {
  await client.query(`
    create table if not exists public.schema_migrations (
      version text primary key,
      applied_at timestamptz not null default now()
    );
  `);
}

async function appliedVersions() {
  const { rows } = await client.query(
    "select version from public.schema_migrations order by version",
  );
  return new Set(rows.map((row) => row.version));
}

async function applyFile(file) {
  const version = file.replace(/\.sql$/, "");
  const sql = readFileSync(join(migrationsDir, file), "utf8");
  console.log(`Applying ${file}...`);
  await client.query("begin");
  try {
    await client.query(sql);
    await client.query(
      "insert into public.schema_migrations (version) values ($1)",
      [version],
    );
    await client.query("commit");
    console.log(`  OK`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}

async function maybeSeed() {
  const seedPath = join(root, "supabase", "seed.sql");
  const seedSql = readFileSync(seedPath, "utf8");
  const { rows } = await client.query(
    "select count(*)::int as count from public.articles",
  );
  if (rows[0].count > 0) {
    console.log("Seed skipped — articles already present.");
    return;
  }
  console.log("Running seed.sql...");
  await client.query(seedSql);
  console.log("  OK");
}

try {
  await client.connect();
  await ensureMigrationsTable();
  const done = await appliedVersions();

  for (const file of migrationFiles) {
    const version = file.replace(/\.sql$/, "");
    if (done.has(version)) {
      console.log(`Skipping ${file} (already applied).`);
      continue;
    }
    await applyFile(file);
  }

  await maybeSeed();
  console.log("Database setup complete.");
} catch (error) {
  console.error("Migration failed:", error.message ?? error);
  process.exit(1);
} finally {
  await client.end();
}
