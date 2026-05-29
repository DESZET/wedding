// Debug test - try inserting into umrah_packages to see the exact error
const sqlite3 = require('sqlite3');
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'wedding.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

// Test inserting with 42 values (the correct number based on the code)
const testInsert = `
INSERT INTO umrah_packages (
  name, description, package_type, duration, price, discount_price, departure_city, airline, airline_logo,
  hotel_mekah, hotel_madinah, hotel_rating, distance_haram, meals_included, tour_guide,
  visa_assistance, vaccination_assistance, transport_type, group_size, availability,
  rating, reviews_count, included_features, excluded_features, itinerary, important_notes,
  departure_dates, images, featured, best_seller, early_bird_discount, payment_plans, tags,
  quota_year, payment_terms, requirements, timeline, registration_deadline,
  available_quota, training_sessions, medical_facility, accommodation_details
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

// Count the ? placeholders
const placeholders = testInsert.match(/\?/g);
console.log('Number of placeholders (?):', placeholders ? placeholders.length : 0);

// Try with test values
const testValues = [
  'Test Package',
  'Test Description',
  'umrah',
  9,
  50000000,
  null,
  'Jakarta',
  'Garuda Indonesia',
  '',
  'Hotel Mekah Test',
  'Hotel Madinah Test',
  4,
  '500m',
  1,
  1,
  1,
  1,
  'Private Bus',
  30,
  15,
  4.5,
  0,
  '[]',
  '[]',
  '[]',
  '[]',
  '[]',
  '[]',
  0,
  0,
  0,
  '[]',
  '',
  '1445H/2024',
  '[]',
  '[]',
  '[]',
  '',
  25,
  12,
  1,
  '{}'
];

console.log('Number of test values:', testValues.length);

db.run(testInsert, testValues, function(err) {
  if (err) {
    console.error('Error inserting:', err.message);
  } else {
    console.log('Insert successful! Last ID:', this.lastID);
    // Delete the test record
    db.run('DELETE FROM umrah_packages WHERE id = ?', [this.lastID]);
  }
  db.close();
});

