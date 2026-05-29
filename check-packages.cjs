const Database = require('better-sqlite3');
const db = new Database('wedding.db');

console.log('=== Checking Umrah Packages ===');
const umrahPackages = db.prepare('SELECT * FROM umrah_packages').all();
console.log('Count:', umrahPackages.length);
console.log(JSON.stringify(umrahPackages, null, 2));

console.log('\n=== Checking Haji Packages ===');
try {
  const HajiPackages = db.prepare('SELECT * FROM Haji_packages').all();
  console.log('Count:', HajiPackages.length);
  console.log(JSON.stringify(HajiPackages, null, 2));
} catch(e) {
  console.log('Error with Haji_packages table:', e.message);
}

console.log('\n=== Checking if tables exist ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables);

db.close();

