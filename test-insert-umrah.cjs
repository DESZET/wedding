// Test inserting an umrah package
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'wedding.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

const testPackage = {
  name: 'Test Package',
  description: 'Test Description',
  package_type: 'umrah',
  duration: 10,
  price: 50000000,
  discount_price: 45000000,
  departure_city: 'Jakarta',
  airline: 'Garuda Indonesia',
  airline_logo: '',
  hotel_mekah: 'Movenpick Hotel',
  hotel_madinah: 'Madinah Hilton',
  hotel_rating: 5,
  distance_haram: '500m',
  meals_included: 1,
  tour_guide: 1,
  visa_assistance: 1,
  vaccination_assistance: 1,
  transport_type: 'Bus',
  group_size: 40,
  availability: 100,
  rating: 4.5,
  reviews_count: 50,
  included_features: JSON.stringify(['Visa', 'Hotel', 'Flight', 'Transport']),
  excluded_features: JSON.stringify(['Personal expenses']),
  itinerary: JSON.stringify([{ day: 1, title: 'Departure', description: 'Fly to Jeddah', icon: 'Plane' }]),
  important_notes: JSON.stringify(['Bring passport', 'Bring vaccination certificate']),
  departure_dates: JSON.stringify([{ date: '2024-06-01', seats: 50, price_variation: 0 }]),
  images: JSON.stringify(['/uploads/test.jpg']),
  featured: 1,
  best_seller: 0,
  early_bird_discount: 1,
  payment_plans: JSON.stringify([{ name: 'DP 30%', installments: 3 }]),
  tags: JSON.stringify(['popular', 'umrah']),
  quota_year: '',
  payment_terms: JSON.stringify([]),
  requirements: JSON.stringify([]),
  timeline: JSON.stringify([]),
  registration_deadline: '',
  available_quota: 0,
  training_sessions: 0,
  medical_facility: 0,
  accommodation_details: JSON.stringify({})
};

db.serialize(() => {
  const sql = `
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

  const params = [
    testPackage.name, testPackage.description, testPackage.package_type, testPackage.duration,
    testPackage.price, testPackage.discount_price, testPackage.departure_city, testPackage.airline,
    testPackage.airline_logo, testPackage.hotel_mekah, testPackage.hotel_madinah, testPackage.hotel_rating,
    testPackage.distance_haram, testPackage.meals_included, testPackage.tour_guide,
    testPackage.visa_assistance, testPackage.vaccination_assistance, testPackage.transport_type,
    testPackage.group_size, testPackage.availability, testPackage.rating, testPackage.reviews_count,
    testPackage.included_features, testPackage.excluded_features, testPackage.itinerary,
    testPackage.important_notes, testPackage.departure_dates, testPackage.images,
    testPackage.featured, testPackage.best_seller, testPackage.early_bird_discount,
    testPackage.payment_plans, testPackage.tags, testPackage.quota_year, testPackage.payment_terms,
    testPackage.requirements, testPackage.timeline, testPackage.registration_deadline,
    testPackage.available_quota, testPackage.training_sessions, testPackage.medical_facility,
    testPackage.accommodation_details
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error inserting package:', err.message);
      console.error('SQL Error:', err);
    } else {
      console.log('Package created successfully! ID:', this.lastID);
    }
    db.close();
  });
});

