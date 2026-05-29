// Test API directly - simulate what the frontend does
const sqlite3 = require('sqlite3');
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'wedding.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

// Get data from both tables - simulate what the API does
console.log('=== Simulating API Response ===\n');

db.all("SELECT * FROM umrah_packages ORDER BY createdAt DESC", (err, items) => {
  if (err) {
    console.error('Error getting umrah_packages:', err);
    db.close();
    process.exit(1);
  }
  
  console.log('Raw umrah_packages count:', items.length);
  
  // Parse JSON fields - exactly like the API does
  const parsedItems = items.map((item) => {
    try {
      return {
        ...item,
        // Handle package_type - default to 'umrah' for old records
        package_type: item.package_type || 'umrah',
        included_features: item.included_features ? JSON.parse(item.included_features) : [],
        excluded_features: item.excluded_features ? JSON.parse(item.excluded_features) : [],
        itinerary: item.itinerary ? JSON.parse(item.itinerary) : [],
        important_notes: item.important_notes ? JSON.parse(item.important_notes) : [],
        departure_dates: item.departure_dates ? JSON.parse(item.departure_dates) : [],
        images: item.images ? JSON.parse(item.images) : [],
        payment_plans: item.payment_plans ? JSON.parse(item.payment_plans) : [],
        tags: item.tags ? JSON.parse(item.tags) : [],
        // Haji fields
        payment_terms: item.payment_terms ? JSON.parse(item.payment_terms) : [],
        requirements: item.requirements ? JSON.parse(item.requirements) : [],
        timeline: item.timeline ? JSON.parse(item.timeline) : [],
        accommodation_details: item.accommodation_details ? JSON.parse(item.accommodation_details) : {},
        meals_included: Boolean(item.meals_included),
        tour_guide: Boolean(item.tour_guide),
        visa_assistance: Boolean(item.visa_assistance),
        vaccination_assistance: Boolean(item.vaccination_assistance),
        featured: Boolean(item.featured),
        best_seller: Boolean(item.best_seller),
        early_bird_discount: Boolean(item.early_bird_discount),
        medical_facility: Boolean(item.medical_facility)
      };
    } catch (parseError) {
      console.error('Error parsing item:', item.id, parseError);
      return null;
    }
  }).filter(item => item !== null);
  
  console.log('Parsed umrah_packages count:', parsedItems.length);
  
  // Check for problematic fields
  if (parsedItems.length > 0) {
    const firstItem = parsedItems[0];
    console.log('\nFirst item analysis:');
    console.log('- id:', firstItem.id, typeof firstItem.id);
    console.log('- name:', firstItem.name, typeof firstItem.name);
    console.log('- price:', firstItem.price, typeof firstItem.price);
    console.log('- duration:', firstItem.duration, typeof firstItem.duration);
    console.log('- departure_city:', firstItem.departure_city, typeof firstItem.departure_city);
    console.log('- airline:', firstItem.airline, typeof firstItem.airline);
    console.log('- hotel_mekah:', firstItem.hotel_mekah, typeof firstItem.hotel_mekah);
    console.log('- hotel_madinah:', firstItem.hotel_madinah, typeof firstItem.hotel_madinah);
    console.log('- hotel_rating:', firstItem.hotel_rating, typeof firstItem.hotel_rating);
    console.log('- distance_haram:', firstItem.distance_haram, typeof firstItem.distance_haram);
    console.log('- transport_type:', firstItem.transport_type, typeof firstItem.transport_type);
    console.log('- group_size:', firstItem.group_size, typeof firstItem.group_size);
    console.log('- availability:', firstItem.availability, typeof firstItem.availability);
    console.log('- rating:', firstItem.rating, typeof firstItem.rating);
    console.log('- reviews_count:', firstItem.reviews_count, typeof firstItem.reviews_count);
    console.log('- included_features:', firstItem.included_features);
    console.log('- excluded_features:', firstItem.excluded_features);
    console.log('- itinerary:', firstItem.itinerary);
    console.log('- important_notes:', firstItem.important_notes);
    console.log('- departure_dates:', firstItem.departure_dates);
    console.log('- images:', firstItem.images);
    console.log('- featured:', firstItem.featured);
    console.log('- best_seller:', firstItem.best_seller);
    console.log('- early_bird_discount:', firstItem.early_bird_discount);
    console.log('- payment_plans:', firstItem.payment_plans);
    console.log('- tags:', firstItem.tags);
  }
  
  // Test the response format
  const response = {
    success: true,
    data: parsedItems,
    total: parsedItems.length
  };
  
  console.log('\n=== API Response Format ===');
  console.log('success:', response.success);
  console.log('total:', response.total);
  console.log('data is array:', Array.isArray(response.data));
  console.log('First item exists:', response.data.length > 0);
  
  // Test client-side check
  console.log('\n=== Client-side Checks ===');
  console.log('response.success:', response.success);
  console.log('Array.isArray(response.data):', Array.isArray(response.data));
  console.log('Should set packages:', response.success && Array.isArray(response.data));
  
  db.close();
});

