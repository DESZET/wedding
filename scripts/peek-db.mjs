import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import initSqlJs from "sql.js";

const DB_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../wedding.db");
const SQL = await initSqlJs();
const db = new SQL.Database(fs.readFileSync(DB_PATH));

for (const table of ["packages", "gallery", "settings", "testimonials"]) {
  try {
    const r = db.exec(`SELECT * FROM "${table}" LIMIT 3`);
    console.log(table, r.length ? r[0].values.length + " rows sample" : "empty", r[0]?.values);
  } catch (e) {
    console.log(table, "error", e.message);
  }
}
