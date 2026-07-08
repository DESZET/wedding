import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env.local") });
dotenv.config({ path: path.join(root, ".env") });

let url = (process.env.DATABASE_URL || "").trim();
const token = process.env.DATABASE_AUTH_TOKEN?.trim();

if (!url || !token) {
  console.log("FAIL: DATABASE_URL or DATABASE_AUTH_TOKEN missing in .env.local");
  process.exit(1);
}

if (url.startsWith("libsql://")) {
  url = url.replace("libsql://", "https://");
}

const client = createClient({ url, authToken: token });

try {
  await Promise.race([
    client.execute("SELECT 1"),
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout 15s")), 15000)),
  ]);
  console.log("OK: Turso connected");

  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
  );
  console.log(`Tables (${tables.rows.length}):`, tables.rows.map((r) => r.name).join(", ") || "(none)");

  try {
    const admins = await client.execute("SELECT username FROM admin_credentials LIMIT 5");
    console.log("Admin users:", admins.rows.map((r) => r.username).join(", ") || "(empty)");
  } catch {
    console.log("admin_credentials: table missing");
  }

  try {
    const settings = await client.execute("SELECT COUNT(*) AS c FROM settings");
    console.log("Settings rows:", settings.rows[0]?.c ?? 0);
  } catch {
    console.log("settings: table missing");
  }
} catch (err) {
  console.log("FAIL:", err.message);
  process.exit(1);
}
