import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const commit = process.argv[2] || "d37851d";
const out = path.join(root, "wedding.db.backup");

const hash = execSync(`git rev-parse ${commit}:wedding.db`, { cwd: root }).toString().trim();
const data = execSync(`git cat-file blob ${hash}`, { cwd: root, encoding: "buffer" });
fs.writeFileSync(out, data);
console.log(`Saved ${out} (${data.length} bytes)`);
