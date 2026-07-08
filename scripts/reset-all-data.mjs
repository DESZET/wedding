import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import initSqlJs from "sql.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DB_PATH = path.join(root, "wedding.db");
const API_URL = process.env.MIGRATE_API_URL || "https://galeriaorganizer.vercel.app";
const SECRET = process.env.MIGRATE_SECRET;

async function clearLocalDb() {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(DB_PATH));
  const tables = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  )[0].values;

  db.run("PRAGMA foreign_keys = OFF");
  for (const [name] of tables) {
    db.run(`DELETE FROM "${name}"`);
    console.log(`  local ${name}: cleared`);
  }
  db.run("PRAGMA foreign_keys = ON");

  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  console.log("✓ Local wedding.db cleared");
}

async function clearRemoteDb() {
  if (!SECRET) {
    console.log("⚠ MIGRATE_SECRET not set — skipping production reset");
    return;
  }

  const response = await fetch(`${API_URL}/api/migrate-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: SECRET }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || response.statusText);
  }
  console.log("✓ Production database cleared");
}

async function main() {
  console.log("Resetting all data...\n");
  await clearLocalDb();
  await clearRemoteDb();
  console.log("\nDone. Database kosong — silakan isi data baru lewat admin panel.");
  console.log("Login production: admin / admin123 (dibuat otomatis saat pertama kali buka API)");
}

main().catch((err) => {
  console.error("Reset failed:", err.message);
  process.exit(1);
});
