import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import Database from "better-sqlite3";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env.local") });
dotenv.config({ path: path.join(root, ".env") });

const defaultSettings = {
  "site-name": "Galeria Wedding & Umrah",
  "site-logo": "/uploads/image-1780072981316-469111360.png",
  "logo-letter": "G",
  "tagline": "Mewujudkan Pernikahan Impian Anda",
  "description": "Layanan Wedding Organizer, Paket Umrah & Haji, serta Percetakan Digital Offset Terlengkap dan Terpercaya.",
  "phone": "085876244484",
  "whatsapp": "085876244484",
  "wedding-whatsapp": "085876244484",
  "email": "galerianet6@gmail.com",
  "address": "galeria Rias Pengantin & Agen MHU , Pangeran Diponegoro, Area Sawah, Penolih, Kec. Kaligondang, Kabupaten Purbalingga, Jawa Tengah 53391",
  "hours-weekday": "08.00 – 17.00 WIB",
  "hours-saturday": "08.00 – 15.00 WIB",
  "hours-sunday": "Tutup",
  "maps-query": "galeria Rias Pengantin & Agen MHU Penolih Purbalingga",
  "primary-color": "#058bb8",
  "secondary-color": "#0062ff",
  "accent-color": "#ff9494",
  "background-color": "#ffffff",
  "instagram": "https://www.instagram.com/galeria_wedding_organizer?stkn=MXAxMXI0bjJlNWR6eA==",
  "hero-title": "Galeria Wedding & Organizer",
  "hero-subtitle": "Mewujudkan Momen Terindah Pernikahan Anda"
};

// 1. Sync to SQLite
const dbs = [
  path.join(root, "wedding.db"),
  path.resolve(root, "../wedding.db")
];

for (const dbPath of dbs) {
  try {
    const db = new Database(dbPath);
    db.exec(`CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    for (const [key, val] of Object.entries(defaultSettings)) {
      const ex = db.prepare("SELECT * FROM settings WHERE key = ?").get(key);
      if (!ex) {
        db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run(key, val);
        console.log(`[${path.basename(dbPath)}] Inserted: ${key} = ${val}`);
      } else if (!ex.value || ex.value === "") {
        db.prepare("UPDATE settings SET value = ? WHERE key = ?").run(val, key);
        console.log(`[${path.basename(dbPath)}] Updated empty: ${key} = ${val}`);
      }
    }
    console.log(`[${path.basename(dbPath)}] Total settings:`, db.prepare("SELECT count(*) as c FROM settings").get().c);
  } catch (e) {
    console.warn(`Error on ${dbPath}:`, e.message);
  }
}

// 2. Sync to Turso
try {
  const url = process.env.DATABASE_URL?.replace("libsql://", "https://");
  const token = process.env.DATABASE_AUTH_TOKEN;
  if (url && token) {
    const c = createClient({ url, authToken: token });
    for (const [key, val] of Object.entries(defaultSettings)) {
      const ex = await c.execute({ sql: "SELECT * FROM settings WHERE key = ?", args: [key] });
      if (ex.rows.length === 0) {
        await c.execute({ sql: "INSERT INTO settings (key, value) VALUES (?, ?)", args: [key, val] });
        console.log(`[Turso] Inserted: ${key} = ${val}`);
      } else if (!ex.rows[0].value) {
        await c.execute({ sql: "UPDATE settings SET value = ? WHERE key = ?", args: [val, key] });
        console.log(`[Turso] Updated empty: ${key} = ${val}`);
      }
    }
    console.log("[Turso] Synced successfully");
  }
} catch (e) {
  console.warn("Error on Turso:", e.message);
}

console.log("Sync complete!");
