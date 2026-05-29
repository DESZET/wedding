const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('wedding.db');

const tables = ['gallery', 'testimonials', 'printing_categories', 'printing_products', 'printing_packages', 'packages', 'umrah_packages', 'haji_packages', 'service_faqs', 'venues', 'stats', 'section_images', 'videos', 'wedding_show_videos', 'settings', 'admin_credentials'];

let count = 0;
tables.forEach(table => {
  db.get(`SELECT COUNT(*) as count FROM ${table}`, [], (err, row) => {
    count++;
    if (err) {
      console.log(`${table}: Error - ${err.message}`);
    } else {
      console.log(`${table}: ${row.count} rows`);
    }
    if (count === tables.length) {
      db.close();
    }
  });
});

