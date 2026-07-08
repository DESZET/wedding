import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env.local") });

let url = process.env.DATABASE_URL?.trim();
const token = process.env.DATABASE_AUTH_TOKEN?.trim();
if (url?.startsWith("libsql://")) url = url.replace("libsql://", "https://");

const client = createClient({ url, authToken: token });
const res = await client.execute("SELECT username, password FROM admin_credentials");
console.log("Users in Turso:");
for (const row of res.rows) {
  const u = row.username;
  const hash = String(row.password);
  const ok123 = await bcrypt.compare("admin123", hash);
  console.log(`  - ${u}: hash rounds=${hash.slice(0, 7)} admin123=${ok123 ? "YES" : "no"}`);
}
