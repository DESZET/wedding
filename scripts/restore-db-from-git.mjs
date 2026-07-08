import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import initSqlJs from "sql.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const commit = process.argv[2] || "53fc662";
const out = path.join(root, "wedding.db");

const hash = execSync(`git rev-parse ${commit}:wedding.db`, { cwd: root }).toString().trim();
const data = execSync(`git cat-file blob ${hash}`, { cwd: root, encoding: "buffer" });
fs.writeFileSync(out, data);
console.log(`Restored wedding.db from ${commit} (${data.length} bytes)`);

const SQL = await initSqlJs();
const db = new SQL.Database(data);
const tables = db.exec(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
)[0].values;

for (const [name] of tables) {
  const count = db.exec(`SELECT COUNT(*) FROM "${name}"`)[0].values[0][0];
  if (count > 0) console.log(`  ${name}: ${count} rows`);
}
