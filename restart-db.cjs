const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('wedding.db');

db.serialize(async () => {
  try {
    // Close existing connection if any (though in this script it's new)
    // Drop all tables
    const tables = [
      'gallery',
      'testimonials',
      'packages',
      'venues',
      'stats',
      'section_images',
      'videos',
      'wedding_show_videos',
      'settings',
      'umrah_packages',
      'haji_packages',
      'service_faqs',
      'printing_categories',
      'printing_products',
      'printing_packages',
      'admin_credentials'
    ];

    for (const table of tables) {
      db.run(`DROP TABLE IF EXISTS ${table}`);
    }

    // Now recreate tables (copy from initDatabase logic)
    // Gallery table
    db.run(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        image TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Testimonials table
    db.run(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        text TEXT NOT NULL,
        rating INTEGER NOT NULL,
        date TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Printing Categories table
    db.run(`
      CREATE TABLE IF NOT EXISTS printing_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Printing Products table
    db.run(`
      CREATE TABLE IF NOT EXISTS printing_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        discount_price REAL,
        size_options TEXT,
        material_options TEXT,
        color_options TEXT,
        design_template_url TEXT,
        images TEXT,
        is_custom_design BOOLEAN DEFAULT FALSE,
        estimated_time TEXT,
        min_order INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT TRUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES printing_categories (id)
      )
    `);

    // Printing Packages table
    db.run(`
      CREATE TABLE IF NOT EXISTS printing_packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        discount_price REAL,
        category TEXT,
        included_items TEXT,
        max_products INTEGER DEFAULT 0,
        validity_days INTEGER DEFAULT 30,
        is_active BOOLEAN DEFAULT TRUE,
        featured BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Packages table
    db.run(`
      CREATE TABLE IF NOT EXISTS packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        highlighted BOOLEAN DEFAULT FALSE,
        features TEXT,
        longDescription TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Umrah packages table
    db.run(`
      CREATE TABLE IF NOT EXISTS umrah_packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        duration INTEGER DEFAULT 0,
        price REAL NOT NULL,
        discount_price REAL,
        departure_city TEXT,
        airline TEXT,
        airline_logo TEXT,
        hotel_mekah TEXT,
        hotel_madinah TEXT,
        hotel_rating INTEGER DEFAULT 0,
        distance_haram TEXT,
        meals_included BOOLEAN DEFAULT 0,
        tour_guide BOOLEAN DEFAULT 0,
        visa_assistance BOOLEAN DEFAULT 0,
        vaccination_assistance BOOLEAN DEFAULT 0,
        transport_type TEXT,
        group_size INTEGER DEFAULT 0,
        availability INTEGER DEFAULT 0,
        rating REAL DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        included_features TEXT,
        excluded_features TEXT,
        itinerary TEXT,
        important_notes TEXT,
        departure_dates TEXT,
        images TEXT,
        featured BOOLEAN DEFAULT 0,
        best_seller BOOLEAN DEFAULT 0,
        early_bird_discount BOOLEAN DEFAULT 0,
        payment_plans TEXT,
        tags TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Haji packages table
    db.run(`
      CREATE TABLE IF NOT EXISTS haji_packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        quota_year TEXT,
        price REAL NOT NULL,
        discount_price REAL,
        payment_terms TEXT,
        included_features TEXT,
        excluded_features TEXT,
        requirements TEXT,
        timeline TEXT,
        images TEXT,
        featured BOOLEAN DEFAULT 0,
        registration_deadline TEXT,
        available_quota INTEGER DEFAULT 0,
        training_sessions INTEGER DEFAULT 0,
        medical_facility BOOLEAN DEFAULT 0,
        rating REAL DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        accommodation_details TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Service FAQs table
    db.run(`
      CREATE TABLE IF NOT EXISTS service_faqs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category TEXT,
        service_type TEXT DEFAULT 'general',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Venues table
    db.run(`
      CREATE TABLE IF NOT EXISTS venues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        price TEXT NOT NULL,
        capacity INTEGER,
        description TEXT,
        image TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Stats table
    db.run(`
      CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT NOT NULL,
        value INTEGER NOT NULL,
        image TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Section images table
    db.run(`
      CREATE TABLE IF NOT EXISTS section_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section TEXT NOT NULL,
        image_url TEXT NOT NULL,
        alt_text TEXT,
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Videos table
    db.run(`
      CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        videoPath TEXT NOT NULL,
        thumbnail TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Wedding Show Videos table
    db.run(`
      CREATE TABLE IF NOT EXISTS wedding_show_videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        videoPath TEXT NOT NULL,
        thumbnail TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Settings table
    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Admin credentials table
    db.run(`
      CREATE TABLE IF NOT EXISTS admin_credentials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database restarted successfully');
  } catch (error) {
    console.error('Error restarting database:', error);
  }
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('Database connection closed');
  }
});
