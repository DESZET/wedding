/**
 * Reset admin login on Turso to: admin / admin123
 * Run: node scripts/reset-admin-turso.mjs
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

let url = process.env.DATABASE_URL?.trim();
const authToken = process.env.DATABASE_AUTH_TOKEN;
const hash =
  "$2b$04$SV1HeWWs5R7oXC3pym8YzO8rLOyaEBEDmxo.xBmFWK23Wxix3hgq6";

if (!url || !authToken) {
  console.error("Set DATABASE_URL and DATABASE_AUTH_TOKEN in .env.local");
  process.exit(1);
}
if (url.startsWith("libsql://")) url = url.replace("libsql://", "https://");

const turso = createClient({ url, authToken });

await turso.execute("DELETE FROM admin_credentials WHERE username = ?", ["admin"]);
await turso.execute(
  "INSERT INTO admin_credentials (username, password, createdAt) VALUES (?, ?, CURRENT_TIMESTAMP)",
  ["admin", hash],
);
console.log("OK — login: admin / admin123");
