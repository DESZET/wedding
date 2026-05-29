// Check images field in umrah_packages table
const sqlite3 = require('sqlite3');
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'wedding.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

// Get data from umrah_packages including images
db.all("SELECT id, name, package_type, price, images FROM umrah_packages", (err, rows) => {
  if (err) {
    console.error('Error getting data:', err);
    db.close();
    process.exit(1);
  }
  
  console.log('=== Checking Umrah Packages Images ===\n');
  
  rows.forEach((row) => {
    console.log(`ID: ${row.id}`);
    console.log(`  Name: ${row.name}`);
    console.log(`  package_type: ${row.package_type}`);
    console.log(`  price: ${row.price}`);
    console.log(`  images: ${row.images}`);
    console.log(`  images is null: ${row.images === null}`);
    console.log(`  images is empty: ${row.images === ''}`);
    console.log('---');
  });
  
  db.close();
});

