const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('wedding.db');

db.serialize(() => {
  // Fix package 1
  db.run(`UPDATE umrah_packages SET
    included_features = '["asdawd"]',
    excluded_features = '["asdwad"]'
    WHERE id = 1`);

  // Fix package 2
  db.run(`UPDATE umrah_packages SET
    included_features = '["adsad"]',
    excluded_features = '["asdd"]',
    departure_dates = '[]'
    WHERE id = 2`);

  console.log('Database fixes applied successfully');
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('Database connection closed');
  }
});
