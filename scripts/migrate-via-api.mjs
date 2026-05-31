import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import initSqlJs from "sql.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../wedding.db");
const API_URL = process.env.MIGRATE_API_URL || "https://galeriaorganizer.vercel.app";
const SECRET = process.env.MIGRATE_SECRET;

if (!SECRET) {
  console.error("Set MIGRATE_SECRET environment variable.");
  process.exit(1);
}

const SQL = await initSqlJs();
const db = new SQL.Database(fs.readFileSync(DB_PATH));

const tables = db
  .exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")[0]
  .values.map(([name]) => name);

async function importTable(table) {
  const result = db.exec(`SELECT * FROM "${table}"`);
  const parsedRows =
    result.length === 0
      ? []
      : result[0].values.map((row) =>
          Object.fromEntries(result[0].columns.map((col, i) => [col, row[i]]))
        );

  const response = await fetch(`${API_URL}/api/migrate-import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: SECRET, table, rows: parsedRows, truncate: false }),
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(`${table}: ${payload.error || response.statusText}`);
  }

  console.log(`✓ ${table}: ${payload.count} rows`);
}

async function resetRemote() {
  const response = await fetch(`${API_URL}/api/migrate-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: SECRET }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(`reset: ${payload.error || response.statusText}`);
  }
  console.log("✓ Cleared remote tables");
}

async function main() {
  console.log(`Migrating ${tables.length} tables to ${API_URL}...`);
  await resetRemote();

  for (const table of tables) {
    await importTable(table);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
