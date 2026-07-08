import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import initSqlJs from "sql.js";

const file = process.argv[2] || "wedding.db";
const DB_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", file);
const SQL = await initSqlJs();
const db = new SQL.Database(fs.readFileSync(DB_PATH));

console.log(`File: ${file} (${fs.statSync(DB_PATH).size} bytes)`);

const tables = db.exec(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
)[0].values;

let total = 0;
for (const [name] of tables) {
  const count = db.exec(`SELECT COUNT(*) FROM "${name}"`)[0].values[0][0];
  if (count > 0) console.log(`  ${name}: ${count}`);
  total += count;
}
console.log(`Total rows: ${total}`);
