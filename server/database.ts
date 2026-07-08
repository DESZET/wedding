import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@libsql/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../wedding.db');

let db: any | null = null;
let connecting: Promise<any> | null = null;

function useTurso(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

const TURSO_QUERY_MS = 12_000;

function rowToObject(row: unknown): Record<string, unknown> {
  if (!row || typeof row !== 'object') return {};
  if (typeof (row as { toJSON?: () => unknown }).toJSON === 'function') {
    const json = (row as { toJSON: () => unknown }).toJSON();
    if (json && typeof json === 'object' && !Array.isArray(json)) {
      return json as Record<string, unknown>;
    }
  }
  const r = row as { columnNames?: string[]; values?: unknown[] };
  if (r.columnNames?.length && r.values) {
    const out: Record<string, unknown> = {};
    r.columnNames.forEach((name, i) => {
      out[name] = r.values![i];
    });
    return out;
  }
  return row as Record<string, unknown>;
}

async function tursoExecute(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: any[] = [],
): Promise<Awaited<ReturnType<ReturnType<typeof createClient>['execute']>>> {
  return Promise.race([
    client.execute({ sql, args }),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Turso query timed out after ${TURSO_QUERY_MS / 1000}s`)),
        TURSO_QUERY_MS,
      ),
    ),
  ]);
}

function tursoUrl(): string {
  const raw = process.env.DATABASE_URL!.trim();
  // Remote Turso over HTTP is more reliable on serverless than libsql:// wire protocol.
  if (raw.startsWith('libsql://')) {
    return raw.replace('libsql://', 'https://');
  }
  return raw;
}

async function connectTurso(): Promise<any> {
  if (!process.env.DATABASE_AUTH_TOKEN?.trim()) {
    throw new Error('DATABASE_AUTH_TOKEN is missing. Add it in Vercel Environment Variables.');
  }

  const url = tursoUrl();
  console.log('Connecting to Turso at', url);
  const client = createClient({
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  await tursoExecute(client, 'SELECT 1');
  console.log('Turso connected');
  return client;
}

export async function ensureDb(): Promise<any> {
  if (db) return db;

  if (process.env.VERCEL && !process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL and DATABASE_AUTH_TOKEN must be set on Vercel.');
  }

  if (!connecting) {
    connecting = (async () => {
      try {
        if (useTurso()) {
          db = await connectTurso();
        } else {
          const BetterSqlite3 = (await import('better-sqlite3')).default;
          db = new BetterSqlite3(DB_PATH);
        }
        return db;
      } catch (err) {
        connecting = null;
        throw err;
      }
    })();
  }

  return connecting;
}

export function getDb(): any {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export async function dbRun(sql: string, params: any[] = []): Promise<any> {
  const database = db ?? await ensureDb();
  if (useTurso) {
    const res = await tursoExecute(database, sql, params);
    return {
      changes: res.rowsAffected,
      lastInsertRowid: res.lastInsertRowid,
      lastID: res.lastInsertRowid !== undefined ? Number(res.lastInsertRowid) : undefined
    };
  } else {
    const result = database.prepare(sql).run(params);
    return {
      changes: result.changes,
      lastInsertRowid: result.lastInsertRowid,
      lastID: Number(result.lastInsertRowid)
    };
  }
}

export async function dbGet<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  const database = db ?? await ensureDb();
  if (useTurso) {
    const res = await tursoExecute(database, sql, params);
    return rowToObject(res.rows[0]) as T;
  } else {
    return database.prepare(sql).get(params) as T;
  }
}

export async function dbAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const database = db ?? await ensureDb();
  if (useTurso) {
    const res = await tursoExecute(database, sql, params);
    return res.rows.map((row) => rowToObject(row)) as T[];
  } else {
    return database.prepare(sql).all(params) as T[];
  }
}

export async function initDatabase(): Promise<void> {
  try {
    if (!db) {
      await ensureDb();
    }
  } catch (e) {
    console.error('Error ensuring database connection:', e);
    throw e;
  }

  // Turso: never run hundreds of DDL/seed round-trips on serverless cold start.
  if (useTurso) {
    console.log('Turso: skipping schema migration and seeding (use migrate-to-turso locally)');
    return;
  }

  try {
    await dbRun(`CREATE TABLE IF NOT EXISTS printing_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      avatar_url TEXT,
      google_id TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES printing_products (id)
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS umrah_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      package_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      avatar_url TEXT,
      google_id TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (package_id) REFERENCES umrah_packages (id)
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS wedding_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      package_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      avatar_url TEXT,
      google_id TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (package_id) REFERENCES packages (id)
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      image TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      text TEXT NOT NULL,
      rating INTEGER NOT NULL,
      date TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS printing_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      order_index INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS printing_products (
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
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS printing_packages (
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
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      highlighted BOOLEAN DEFAULT FALSE,
      features TEXT,
      longDescription TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS umrah_packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      package_type TEXT DEFAULT 'umrah',
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
    )`);

    await migrateUmrahPackagesTable();

    await dbRun(`CREATE TABLE IF NOT EXISTS haji_packages (
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
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS service_faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT,
      service_type TEXT DEFAULT 'general',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS venues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      price TEXT NOT NULL,
      capacity INTEGER,
      description TEXT,
      image TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      value INTEGER NOT NULL,
      image TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS section_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT NOT NULL,
      image_url TEXT NOT NULL,
      alt_text TEXT,
      order_index INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      videoPath TEXT NOT NULL,
      thumbnail TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS wedding_show_videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      videoPath TEXT NOT NULL,
      thumbnail TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS admin_credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      notes TEXT,
      total_debt REAL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS customer_debts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      is_paid BOOLEAN DEFAULT FALSE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers (id)
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS printing_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT,
      product_id INTEGER,
      quantity INTEGER DEFAULT 1,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS religious_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT,
      package_type TEXT NOT NULL,
      package_id INTEGER,
      package_name TEXT,
      departure_date TEXT,
      number_of_travelers INTEGER DEFAULT 1,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await seedPrintingData();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function migrateUmrahPackagesTable(): Promise<void> {
  try {
    const columns = await dbAll<{ name: string }>("PRAGMA table_info(umrah_packages)");
    const columnNames = columns.map(col => col.name);

    const requiredColumns = [
      { name: 'package_type', type: 'TEXT DEFAULT "umrah"' },
      { name: 'quota_year', type: 'TEXT' },
      { name: 'payment_terms', type: 'TEXT' },
      { name: 'requirements', type: 'TEXT' },
      { name: 'timeline', type: 'TEXT' },
      { name: 'registration_deadline', type: 'TEXT' },
      { name: 'available_quota', type: 'INTEGER DEFAULT 0' },
      { name: 'training_sessions', type: 'INTEGER DEFAULT 0' },
      { name: 'medical_facility', type: 'INTEGER DEFAULT 0' },
      { name: 'accommodation_details', type: 'TEXT' },
    ];

    for (const col of requiredColumns) {
      if (!columnNames.includes(col.name)) {
        console.log(`Adding missing column: ${col.name}`);
        await dbRun(`ALTER TABLE umrah_packages ADD COLUMN ${col.name} ${col.type}`);
      }
    }

    console.log('Umrah packages table migration completed');
  } catch (error) {
    console.error('Error migrating umrah_packages table:', error);
  }
}

async function seedPrintingData(): Promise<void> {
  try {
    // Cek categories, bukan products — supaya tidak re-seed saat products kosong
    const existingCats = await dbAll("SELECT id FROM printing_categories LIMIT 1");
    if (existingCats.length > 0) {
      console.log('Printing categories already exist, skipping seeding');
      return;
    }

    const printingCategories = [
      { name: 'Undangan Pernikahan', description: 'Undangan pernikahan dengan berbagai desain dan bahan', icon: 'FileImage', order_index: 1, is_active: 1 },
      { name: 'Sablon Kaos', description: 'Sablon kaos custom untuk event, promosi, dan merchandise', icon: 'Scissors', order_index: 2, is_active: 1 },
      { name: 'Banner & Spanduk', description: 'Banner dan spanduk untuk promosi dan dekorasi', icon: 'Layout', order_index: 3, is_active: 1 },
      { name: 'ID Card', description: 'Kartu identitas untuk karyawan, member, dan event', icon: 'CreditCard', order_index: 4, is_active: 1 },
      { name: 'Kartu Nama', description: 'Kartu nama profesional untuk bisnis', icon: 'FileText', order_index: 5, is_active: 1 },
      { name: 'Brosur & Flyer', description: 'Brosur dan flyer untuk promosi bisnis', icon: 'FileText', order_index: 6, is_active: 1 },
      { name: 'Stiker & Label', description: 'Stiker dan label untuk branding produk', icon: 'Tag', order_index: 7, is_active: 1 },
      { name: 'Kemasan Produk', description: 'Kemasan dan packaging untuk produk', icon: 'Package', order_index: 8, is_active: 1 },
      { name: 'Merchandise Lainnya', description: 'Produk merchandise lainnya sesuai kebutuhan', icon: 'ShoppingBag', order_index: 9, is_active: 1 },
    ];

    for (const c of printingCategories) {
      await dbRun(
        `INSERT INTO printing_categories (name, description, icon, order_index, is_active) VALUES (?, ?, ?, ?, ?)`,
        [c.name, c.description, c.icon, c.order_index, c.is_active]
      );
    }

    const printingProducts = [
      { category_id: 1, name: 'Undangan Premium Gold', description: 'Undangan pernikahan dengan finishing gold foil dan bahan premium', price: 15000, discount_price: 12000, size_options: 'A5,A6,Custom', material_options: 'Art Paper 260gsm,Art Paper 310gsm,Art Carton', color_options: 'Full Color', design_template_url: '/templates/undangan-premium.html', images: '/printing/undangan-premium.jpg', is_custom_design: 0, estimated_time: '5-7 hari', min_order: 50, is_active: 1 },
      { category_id: 1, name: 'Undangan Simple Elegan', description: 'Undangan pernikahan dengan desain simple namun elegan', price: 8000, discount_price: 6500, size_options: 'A5,A6', material_options: 'Art Paper 210gsm,Art Paper 260gsm', color_options: 'Full Color', design_template_url: null, images: '/printing/undangan-simple.jpg', is_custom_design: 0, estimated_time: '3-5 hari', min_order: 25, is_active: 1 },
      { category_id: 2, name: 'Kaos Polos Custom', description: 'Kaos polos dengan sablon custom untuk event atau promosi', price: 45000, discount_price: 38000, size_options: 'S,M,L,XL,XXL', material_options: 'Cotton Combed 24s,Cotton Combed 30s', color_options: 'Full Color', design_template_url: null, images: '/printing/kaos-custom.jpg', is_custom_design: 0, estimated_time: '7-10 hari', min_order: 10, is_active: 1 },
      { category_id: 3, name: 'Banner Vinyl Outdoor', description: 'Banner vinyl untuk outdoor dengan ketahanan cuaca', price: 75000, discount_price: 65000, size_options: '1x2m,1.5x2m,2x3m,Custom', material_options: 'Vinyl Outdoor 280gsm,Vinyl Outdoor 440gsm', color_options: 'Full Color', design_template_url: null, images: '/printing/banner-vinyl.jpg', is_custom_design: 0, estimated_time: '2-3 hari', min_order: 1, is_active: 1 },
      { category_id: 4, name: 'ID Card Premium', description: 'Kartu identitas dengan finishing premium untuk karyawan', price: 25000, discount_price: 20000, size_options: '8.5x5.4cm,9x5.5cm', material_options: 'PVC Card 0.76mm,PVC Card 1mm', color_options: 'Full Color', design_template_url: null, images: '/printing/id-card.jpg', is_custom_design: 0, estimated_time: '3-5 hari', min_order: 50, is_active: 1 },
      { category_id: 5, name: 'Kartu Nama Premium', description: 'Kartu nama dengan finishing premium untuk bisnis', price: 25000, discount_price: 20000, size_options: '8.5x5.4cm,9x5.5cm', material_options: 'Art Paper 260gsm,Art Paper 310gsm,Art Carton', color_options: 'Full Color', design_template_url: null, images: '/printing/kartu-nama.jpg', is_custom_design: 0, estimated_time: '3-5 hari', min_order: 100, is_active: 1 },
      { category_id: 6, name: 'Brosur A4 Full Color', description: 'Brosur promosi dengan kualitas cetak tinggi', price: 15000, discount_price: 12000, size_options: 'A4,A5', material_options: 'Art Paper 150gsm,Art Paper 210gsm', color_options: 'Full Color', design_template_url: null, images: '/printing/brosur.jpg', is_custom_design: 0, estimated_time: '3-5 hari', min_order: 100, is_active: 1 },
      { category_id: 7, name: 'Stiker Vinyl', description: 'Stiker vinyl untuk branding produk dan promosi', price: 5000, discount_price: 4000, size_options: 'A4,A3,Custom', material_options: 'Vinyl Sticker 100gsm,Vinyl Sticker 150gsm', color_options: 'Full Color', design_template_url: null, images: '/printing/stiker.jpg', is_custom_design: 0, estimated_time: '2-3 hari', min_order: 10, is_active: 1 },
      { category_id: 8, name: 'Kemasan Produk Custom', description: 'Kemasan produk dengan desain custom', price: 30000, discount_price: 25000, size_options: 'Custom', material_options: 'Art Card 250gsm,Art Card 310gsm', color_options: 'Full Color', design_template_url: null, images: '/printing/kemasan.jpg', is_custom_design: 0, estimated_time: '5-7 hari', min_order: 50, is_active: 1 },
      { category_id: 9, name: 'Merchandise Custom', description: 'Produk merchandise dengan desain custom', price: 25000, discount_price: 20000, size_options: 'Custom', material_options: 'Berbagai bahan sesuai produk', color_options: 'Full Color', design_template_url: null, images: '/printing/merchandise.jpg', is_custom_design: 0, estimated_time: '7-14 hari', min_order: 25, is_active: 1 },
    ];

    for (const p of printingProducts) {
      await dbRun(
        `INSERT INTO printing_products (category_id, name, description, price, discount_price, size_options, material_options, color_options, design_template_url, images, is_custom_design, estimated_time, min_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.category_id, p.name, p.description, p.price, p.discount_price, p.size_options, p.material_options, p.color_options, p.design_template_url, p.images, p.is_custom_design, p.estimated_time, p.min_order, p.is_active]
      );
    }

    console.log('Printing categories and products seeded successfully');
  } catch (error) {
    console.error('Error seeding printing data:', error);
  }
}

export async function restartDatabase(): Promise<void> {
  try {
    if (db) {
      if (!useTurso) {
        db.close();
      }
      db = null;
    }
    await initDatabase();
    console.log('Database tables verified/created successfully (existing data preserved)');
  } catch (error) {
    console.error('Error restarting database:', error);
    throw error;
  }
}