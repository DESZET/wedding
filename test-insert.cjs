const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'wedding.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

db.run("INSERT INTO umrah_packages (name, description, package_type, duration, price) VALUES ('Test Package', 'Test description', 'umrah', 7, 5000)", function(err) {
  if (err) {
    console.error('Error inserting:', err.message);
  } else {
    console.log('Success! Inserted with ID:', this.lastID);
  }
  db.close();
});

