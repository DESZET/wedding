/**
 * Hapus akun admin ganda — sisakan satu username saja.
 * Contoh: node scripts/consolidate-admin-turso.mjs galeria
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

const keepUsername = process.argv[2];
if (!keepUsername) {
  console.error("Usage: node scripts/consolidate-admin-turso.mjs <username-to-keep>");
  console.error("Example: node scripts/consolidate-admin-turso.mjs galeria");
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env.local") });
dotenv.config({ path: path.join(root, ".env") });

let url = process.env.DATABASE_URL?.trim();
const authToken = process.env.DATABASE_AUTH_TOKEN?.trim();
if (!url || !authToken) {
  console.error("Set DATABASE_URL and DATABASE_AUTH_TOKEN in .env.local");
  process.exit(1);
}
if (url.startsWith("libsql://")) url = url.replace("libsql://", "https://");

const turso = createClient({ url, authToken });
const before = await turso.execute("SELECT id, username FROM admin_credentials ORDER BY id");
console.log("Before:", before.rows.map((r) => r.username).join(", ") || "(empty)");

const kept = await turso.execute(
  "SELECT id, username, password FROM admin_credentials WHERE username = ?",
  [keepUsername],
);
if (kept.rows.length === 0) {
  console.error(`User "${keepUsername}" not found. Save credentials in admin first, then run again.`);
  process.exit(1);
}

const { id, password } = kept.rows[0];
await turso.execute("DELETE FROM admin_credentials");
await turso.execute(
  "INSERT INTO admin_credentials (id, username, password, createdAt, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
  [id, keepUsername, password],
);

const after = await turso.execute("SELECT username FROM admin_credentials");
console.log("After:", after.rows.map((r) => r.username).join(", "));
console.log(`OK — only "${keepUsername}" can log in.`);
