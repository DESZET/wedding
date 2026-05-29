// Check actual columns in packages table
const sqlite3 = require('sqlite3');
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'wedding.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

// Get table info
db.all("PRAGMA table_info(packages)", (err, rows) => {
  if (err) {
    console.error('Error getting table info:', err);
    db.close();
    process.exit(1);
  }
  
  console.log('=== Packages Table Columns ===');
  console.log('Total columns:', rows.length);
  console.log('');
  
  rows.forEach((row, index) => {
    console.log(`${index + 1}. ${row.name} (${row.type}) - ${row.notnull ? 'NOT NULL' : 'NULL'} - default: ${row.dflt_value}`);
  });
  
  console.log('');
  console.log('=== Column names for INSERT ===');
  console.log(rows.map(r => r.name).join(', '));
  
  db.close();
});

