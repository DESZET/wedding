import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import initSqlJs from "sql.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DB_PATH = path.join(root, "wedding.db");
const API_URL = process.env.MIGRATE_API_URL || "https://galeriaorganizer.vercel.app";
const SECRET = process.env.MIGRATE_SECRET;

// Urutan: booking dulu, baru paket
const TABLES = ["religious_bookings", "umrah_packages", "haji_packages"];

async function clearLocal() {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(DB_PATH));
  const existing = new Set(
    db.exec("SELECT name FROM sqlite_master WHERE type='table'")[0].values.map(([n]) => n)
  );

  db.run("PRAGMA foreign_keys = OFF");
  for (const table of TABLES) {
    if (!existing.has(table)) {
      console.log(`  local ${table}: skip (tabel tidak ada)`);
      continue;
    }
    db.run(`DELETE FROM "${table}"`);
    console.log(`  local ${table}: cleared`);
  }
  db.run("PRAGMA foreign_keys = ON");
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  console.log("✓ Local wedding.db — tabel umrah/haji dikosongkan");
}

async function clearRemote() {
  if (!SECRET) {
    console.log("⚠ MIGRATE_SECRET not set — lewati production");
    return;
  }

  for (const table of TABLES) {
    const response = await fetch(`${API_URL}/api/migrate-import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: SECRET, table, rows: [], truncate: true }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(`${table}: ${payload.error || response.statusText}`);
    }
    console.log(`  production ${table}: cleared`);
  }
  console.log("✓ Production — tabel umrah/haji dikosongkan");
}

async function main() {
  console.log("Menghapus data umrah & haji saja...\n");
  await clearLocal();
  await clearRemote();
  console.log("\nSelesai. Gallery, settings, dll. tidak diubah.");
}

main().catch((err) => {
  console.error("Gagal:", err.message);
  process.exit(1);
});
