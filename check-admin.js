import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('wedding.db');

db.all("SELECT * FROM admin_credentials", [], (err, rows) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Admin credentials:', rows);
  }
  db.close();
});
