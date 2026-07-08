import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { createClient } from "@libsql/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../wedding.db");

if (!process.env.DATABASE_URL || !process.env.DATABASE_AUTH_TOKEN) {
  dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
  dotenv.config({ path: path.resolve(__dirname, "../.env.migration") });
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
}

let url = process.env.DATABASE_URL?.trim();
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing DATABASE_URL or DATABASE_AUTH_TOKEN in environment.");
  process.exit(1);
}

if (url.startsWith("libsql://")) {
  url = url.replace("libsql://", "https://");
}

const sqlite = new Database(DB_PATH, { readonly: true });
const turso = createClient({ url, authToken });

const tables = sqlite
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
  .all()
  .map((r) => r.name);

console.log(`Found ${tables.length} tables in wedding.db`);

async function run(sql, args = []) {
  return turso.execute({ sql, args });
}

function createTableIfNotExists(sql) {
  if (/CREATE TABLE IF NOT EXISTS/i.test(sql)) return sql;
  return sql.replace(/CREATE TABLE\s+/i, "CREATE TABLE IF NOT EXISTS ");
}

async function ensureSchema() {
  const ddls = sqlite
    .prepare(
      `SELECT name, sql FROM sqlite_master
       WHERE type='table' AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%'
       ORDER BY name`,
    )
    .all();

  console.log(`Ensuring ${ddls.length} tables on Turso...`);
  for (const { name, sql } of ddls) {
    try {
      await run(createTableIfNotExists(sql));
      console.log(`  ✓ ${name}`);
    } catch (err) {
      const msg = String(err?.message ?? err);
      if (msg.includes("already exists")) {
        console.log(`  · ${name} (already exists)`);
        continue;
      }
      throw err;
    }
  }
}

async function migrate() {
  await ensureSchema();
  await run("PRAGMA foreign_keys = OFF");

  for (const table of tables) {
    const count = sqlite.prepare(`SELECT COUNT(*) as n FROM "${table}"`).get().n;
    console.log(`\n→ ${table} (${count} rows)`);

    await run(`DELETE FROM "${table}"`);

    if (count === 0) continue;

    const rows = sqlite.prepare(`SELECT * FROM "${table}"`).all();
    const columns = Object.keys(rows[0]);
    const placeholders = columns.map(() => "?").join(", ");
    const colList = columns.map((c) => `"${c}"`).join(", ");
    const insertSql = `INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`;

    for (const row of rows) {
      const values = columns.map((c) => row[c] ?? null);
      await run(insertSql, values);
    }

    console.log(`  ✓ migrated ${count} rows`);
  }

  await run("PRAGMA foreign_keys = ON");
  console.log("\nMigration completed successfully.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
