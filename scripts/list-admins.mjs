import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import initSqlJs from "sql.js";

const DB_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../wedding.db");
const SQL = await initSqlJs();
const db = new SQL.Database(fs.readFileSync(DB_PATH));
const rows = db.exec("SELECT id, username, createdAt FROM admin_credentials");
console.log(rows[0]?.values);
