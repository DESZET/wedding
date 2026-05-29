/**
 * Migration Script: Add package_type and Haji fields to umrah_packages
 * Run with: node migrate-umrah-haji.cjs
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'wedding.db');
const db = new Database(dbPath);

console.log('Starting migration...');

try {
  // Check if package_type column already exists
  const tableInfo = db.prepare("PRAGMA table_info(umrah_packages)").all();
  const columns = tableInfo.map(col => col.name);
  
  console.log('Current columns:', columns);

  // Add package_type column if not exists
  if (!columns.includes('package_type')) {
    db.exec("ALTER TABLE umrah_packages ADD COLUMN package_type TEXT DEFAULT 'umrah'");
    console.log('✓ Added package_type column');
  }

  // Add Haji-specific columns if not exists
  const newColumns = [
    { name: 'quota_year', type: 'TEXT DEFAULT ""' },
    { name: 'payment_terms', type: 'TEXT DEFAULT "[]"' },
    { name: 'requirements', type: 'TEXT DEFAULT "[]"' },
    { name: 'timeline', type: 'TEXT DEFAULT "[]"' },
    { name: 'registration_deadline', type: 'TEXT DEFAULT ""' },
    { name: 'available_quota', type: 'INTEGER DEFAULT 0' },
    { name: 'training_sessions', type: 'INTEGER DEFAULT 0' },
    { name: 'medical_facility', type: 'INTEGER DEFAULT 0' },
    { name: 'accommodation_details', type: 'TEXT DEFAULT "{}"' }
  ];

  for (const col of newColumns) {
    if (!columns.includes(col.name)) {
      db.exec(`ALTER TABLE umrah_packages ADD COLUMN ${col.name} ${col.type}`);
      console.log(`✓ Added ${col.name} column`);
    }
  }

  console.log('\nMigration completed successfully!');
  console.log('\nNote: Existing Haji packages need to be migrated manually or via a data migration script.');

} catch (error) {
  console.error('Migration failed:', error);
} finally {
  db.close();
}

