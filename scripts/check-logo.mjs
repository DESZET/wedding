import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import Database from "better-sqlite3";
import fs from "fs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env.local") });
dotenv.config({ path: path.join(root, ".env") });

console.log("--- Checking public/uploads/ ---");
const uploadDir = path.join(root, "public/uploads");
if (fs.existsSync(uploadDir)) {
  const files = fs.readdirSync(uploadDir);
  console.log("Uploads count:", files.length);
  console.log("Recent files:", files.slice(-10));
} else {
  console.log("No public/uploads dir");
}

console.log("\n--- Checking SQLite wedding.db ---");
try {
  const sqlite = new Database(path.join(root, "wedding.db"));
  const rows = sqlite.prepare("SELECT key, value FROM settings WHERE key LIKE '%logo%'").all();
  console.log("SQLite logo rows:", rows);
} catch (e) {
  console.log("SQLite err:", e.message);
}

console.log("\n--- Checking Turso DB ---");
try {
  const url = (process.env.DATABASE_URL || "").replace("libsql://", "https://");
  const token = process.env.DATABASE_AUTH_TOKEN;
  if (url && token) {
    const client = createClient({ url, authToken: token });
    const res = await client.execute("SELECT key, value FROM settings WHERE key LIKE '%logo%'");
    console.log("Turso logo rows:", res.rows);
  } else {
    console.log("Turso credentials missing");
  }
} catch (e) {
  console.log("Turso err:", e.message);
}
