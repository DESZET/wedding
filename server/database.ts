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
  if (useTurso()) {
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
  if (useTurso()) {
    const res = await tursoExecute(database, sql, params);
    return rowToObject(res.rows[0]) as T;
  } else {
    return database.prepare(sql).get(params) as T;
  }
}

export async function dbAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const database = db ?? await ensureDb();
  if (useTurso()) {
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
  if (useTurso()) {
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

    await seedWeddingPackages();
    await seedUmrahHajiData();
    await seedPrintingData();
    await syncExistingReviewsToTestimonials();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function syncExistingReviewsToTestimonials(): Promise<void> {
  try {
    const reviewTables = [
      { table: 'wedding_reviews', label: 'Wedding' },
      { table: 'printing_reviews', label: 'Percetakan' },
      { table: 'umrah_reviews', label: 'Umrah & Haji' },
    ];

    for (const { table, label } of reviewTables) {
      const reviews = await dbAll<any>(`SELECT * FROM ${table}`);
      for (const rev of reviews) {
        const textContent = rev.comment?.trim() || `Ulasan layanan ${label}`;
        const existing = await dbGet(
          "SELECT id FROM testimonials WHERE name = ? AND text = ?",
          [rev.name, textContent]
        );
        if (!existing) {
          const dateStr = rev.createdAt
            ? new Date(rev.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
            : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
          await dbRun(
            "INSERT INTO testimonials (name, text, rating, date) VALUES (?, ?, ?, ?)",
            [rev.name, textContent, rev.rating || 5, dateStr]
          );
        }
      }
    }
  } catch (err) {
    console.error('Error syncing existing reviews to testimonials:', err);
  }
}

async function migrateUmrahPackagesTable(): Promise<void> {
  try {
    const columns = await dbAll<{ name: string }>("PRAGMA table_info(umrah_packages)");
    const columnNames = columns.map(col => col.name);

    const requiredColumns = [
      { name: 'package_type', type: 'TEXT DEFAULT "umrah"' },
      { name: 'is_active', type: 'BOOLEAN DEFAULT 1' },
      { name: 'discount_price', type: 'REAL' },
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
        console.log(`Adding missing column to umrah_packages: ${col.name}`);
        await dbRun(`ALTER TABLE umrah_packages ADD COLUMN ${col.name} ${col.type}`);
      }
    }

    // Also migrate haji_packages
    const hajiColumns = await dbAll<{ name: string }>("PRAGMA table_info(haji_packages)");
    const hajiColumnNames = hajiColumns.map(col => col.name);
    const requiredHajiColumns = [
      { name: 'is_active', type: 'BOOLEAN DEFAULT 1' },
      { name: 'discount_price', type: 'REAL' }
    ];

    for (const col of requiredHajiColumns) {
      if (!hajiColumnNames.includes(col.name)) {
        console.log(`Adding missing column to haji_packages: ${col.name}`);
        await dbRun(`ALTER TABLE haji_packages ADD COLUMN ${col.name} ${col.type}`);
      }
    }

    // Also migrate packages (wedding packages)
    const pkgColumns = await dbAll<{ name: string }>("PRAGMA table_info(packages)");
    const pkgColumnNames = pkgColumns.map(col => col.name);
    const requiredPkgColumns = [
      { name: 'is_active', type: 'BOOLEAN DEFAULT 1' },
      { name: 'discount_price', type: 'REAL' },
      { name: 'images', type: 'TEXT' }
    ];

    for (const col of requiredPkgColumns) {
      if (!pkgColumnNames.includes(col.name)) {
        console.log(`Adding missing column to packages: ${col.name}`);
        await dbRun(`ALTER TABLE packages ADD COLUMN ${col.name} ${col.type}`);
      }
    }

    console.log('Umrah, Haji & Wedding packages table migration completed');
  } catch (error) {
    console.error('Error migrating tables:', error);
  }
}

async function seedWeddingPackages(): Promise<void> {
  try {
    const existing = await dbAll("SELECT id FROM packages LIMIT 1");
    if (existing.length > 0) return;

    const weddingPackages = [
      {
        name: "Paket Silver Modern Minimalist",
        price: 35000000,
        description: "Pilihan tepat untuk resepsi intim dan sakral dengan dekorasi modern aesthetic, tata rias pengantin premium, dan katering lezat untuk 300 tamu.",
        highlighted: 0,
        features: JSON.stringify([
          "Dekorasi Pelaminan Modern Floral 6-8 Meter",
          "Rias & Gaun Pengantin Akad + Resepsi (MUA Eksklusif)",
          "Katering 300 Porsi Menu Utama + 2 Gubukan",
          "Dokumentasi Foto Full Day + Video Teaser",
          "Tim WO Lapangan 4 Kru + MC Profesional"
        ]),
        longDescription: "Paket Silver dirancang untuk pasangan yang menginginkan pernikahan elegan, minimalis, dan berkesan tanpa repot mengurus vendor secara terpisah."
      },
      {
        name: "Paket Gold Royal Ballroom",
        price: 65000000,
        description: "Paket terpopuler untuk pernikahan gedung atau ballroom megah dengan fasilitas vendor lengkap all-in dan layanan wedding organizer prima 500-600 tamu.",
        highlighted: 1,
        features: JSON.stringify([
          "Dekorasi Pelaminan Mewah 10-12 Meter + Fresh Flowers",
          "Rias & Busana Pengantin, 2 Pasang Orang Tua & 4 Pagar Ayu",
          "Katering 500 Porsi + 4 Gubukan Favorit (Zuppa, Sate, Siomay)",
          "Dokumentasi 2 Foto + 2 Video Cinematic Film + Album Kulit",
          "Tim WO Lapangan 6 Kru + Sound System Konser + Akustik Band"
        ]),
        longDescription: "Paket Gold menghadirkan kemewahan ballroom seutuhnya dengan koordinasi seluruh vendor dari prosesi akad nikah hingga pesta resepsi berakhir."
      },
      {
        name: "Paket Platinum Exclusive Grand Hall",
        price: 95000000,
        description: "Kemewahan paripurna dengan konsep dekorasi 3D megah, katering melimpah untuk 800-1000 tamu, serta hiburan live music band profesional.",
        highlighted: 0,
        features: JSON.stringify([
          "Dekorasi Pelaminan Grand Hall 14-18 Meter Custom Concept",
          "Busana Pengantin Desainer + MUA Top Tier + Touch Up Standby",
          "Katering 800 Porsi + 6 Food Stall Gubukan Premium",
          "Dokumentasi Multi-Camera Cinematic + Teaser Reels Drone",
          "Full Team WO 8 Kru + Wedding Planner Dedicated H-60"
        ]),
        longDescription: "Paket Platinum ditujukan untuk resepsi berskala besar yang membutuhkan penataan estetika tingkat tinggi dan manajemen acara presisi."
      },
      {
        name: "Paket Diamond Presidential Luxury",
        price: 150000000,
        description: "Standar tertinggi royal wedding dengan tata panggung spektakuler, orchestra / full band entertainment, dan hidangan bintang lima untuk 1200+ tamu.",
        highlighted: 0,
        features: JSON.stringify([
          "Dekorasi Presidential Hall 20+ Meter + Full Fresh Import Flowers",
          "High-End Haute Couture Wedding Gown + Signature MUA",
          "Katering 1200 Porsi + 8 Gubukan Mewah + Dessert Station",
          "Liputan Full Cinematic Film + Drone 4K + Album Handcrafted",
          "Full Crew WO 12 Kru + VIP Protocol Service"
        ]),
        longDescription: "Paket Diamond adalah perayaan cinta megah bak kerajaan dengan segala kemudahan dan fasilitas terbaik tanpa kompromi."
      }
    ];

    for (const pkg of weddingPackages) {
      await dbRun(
        `INSERT INTO packages (name, price, description, highlighted, features, longDescription) VALUES (?, ?, ?, ?, ?, ?)`,
        [pkg.name, pkg.price, pkg.description, pkg.highlighted, pkg.features, pkg.longDescription]
      );
    }
    console.log('Wedding packages seeded successfully');
  } catch (error) {
    console.error('Error seeding wedding packages:', error);
  }
}

async function seedUmrahHajiData(): Promise<void> {
  try {
    const existingUmrah = await dbAll("SELECT id FROM umrah_packages LIMIT 1");
    if (existingUmrah.length === 0) {
      const umrahList = [
        {
          name: "Paket Umrah Reguler 9 Hari Barokah",
          description: "Program ibadah umrah ekonomis berkualitas dengan penerbangan langsung Saudi Airlines dan hotel bintang 4 dekat pelataran masjid.",
          package_type: "umrah",
          duration: 9,
          price: 28500000,
          discount_price: 26900000,
          departure_city: "Jakarta",
          airline: "Saudi Airlines",
          hotel_mekah: "Le Meridien Towers / Setaraf Bintang 4",
          hotel_madinah: "Concorde Al Khair / Setaraf Bintang 4",
          hotel_rating: 4,
          distance_haram: "±300m ke Pelataran",
          meals_included: 1,
          tour_guide: 1,
          visa_assistance: 1,
          vaccination_assistance: 1,
          transport_type: "Bus Eksekutif AC",
          group_size: 45,
          availability: 18,
          rating: 4.9,
          reviews_count: 320,
          featured: 0,
          best_seller: 1,
          images: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80, https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80",
          included_features: JSON.stringify([
            "Tiket Pesawat PP Direct Flight",
            "Hotel Bintang 4 Makkah & Madinah",
            "Makan 3x Fullboard Buffet Menu Indonesia",
            "Visa Umrah Resmi + Asuransi Perjalanan",
            "Mutawwif Berpengalaman Lulusan Madinah",
            "Free Air Zamzam 5 Liter & Perlengkapan Lengkap"
          ])
        },
        {
          name: "Paket Umrah VIP Clock Tower 12 Hari",
          description: "Kenyamanan ibadah bintang 5 menginap langsung di Tower Zamzam Clock Makkah dengan pemandangan langsung ke arah Ka'bah dan Kereta Cepat.",
          package_type: "umrah",
          duration: 12,
          price: 38900000,
          discount_price: 36500000,
          departure_city: "Jakarta",
          airline: "Garuda Indonesia",
          hotel_mekah: "Makkah Clock Royal Tower (Fairmont) Bintang 5",
          hotel_madinah: "Anwar Al Madinah Movenpick Bintang 5",
          hotel_rating: 5,
          distance_haram: "±50m (Pelataran Depan)",
          meals_included: 1,
          tour_guide: 1,
          visa_assistance: 1,
          vaccination_assistance: 1,
          transport_type: "Kereta Cepat Haramain + Bus VIP",
          group_size: 35,
          availability: 12,
          rating: 5.0,
          reviews_count: 210,
          featured: 1,
          best_seller: 0,
          images: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80, https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80",
          included_features: JSON.stringify([
            "Tiket Pesawat Garuda Indonesia PP Direct",
            "Hotel Bintang 5 Depan Masjidil Haram (Clock Tower)",
            "Kereta Cepat Haramain Speed Train (Madinah-Makkah)",
            "Makan Buffet Hotel Bintang 5 Lengkap",
            "City Tour Thaif & Wisata Sejarah Lengkap",
            "Koper Fiber Eksklusif + Handcarry + Batik"
          ])
        },
        {
          name: "Paket Umrah Plus Turki Cappadocia 12 Hari",
          description: "Kombinasi ibadah umrah khusyuk di Tanah Suci dan napak tilas sejarah Islam di Istanbul serta keindahan lanskap balon udara Cappadocia.",
          package_type: "umrah",
          duration: 12,
          price: 44500000,
          discount_price: 41900000,
          departure_city: "Jakarta",
          airline: "Turkish Airlines",
          hotel_mekah: "Pullman Zamzam Makkah Bintang 5",
          hotel_madinah: "Dar Al Taqwa Madinah Bintang 5",
          hotel_rating: 5,
          distance_haram: "±100m ke Masjidil Haram",
          meals_included: 1,
          tour_guide: 1,
          visa_assistance: 1,
          vaccination_assistance: 1,
          transport_type: "Bus Wisata Deluxe Turki & Saudi",
          group_size: 30,
          availability: 10,
          rating: 5.0,
          reviews_count: 145,
          featured: 0,
          best_seller: 0,
          images: "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=80, https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80",
          included_features: JSON.stringify([
            "Penerbangan Turkish Airlines Full Service",
            "Wisata Sejarah Blue Mosque, Hagia Sophia & Bosphorus Cruise",
            "Kunjungan Cappadocia Cave Suite Hotel",
            "Umrah Lengkap di Makkah & Madinah Bintang 5",
            "Free Visa Turki & Visa Umrah",
            "Perlengkapan Ibadah & Travelling Lengkap"
          ])
        }
      ];

      for (const u of umrahList) {
        await dbRun(
          `INSERT INTO umrah_packages (
            name, description, package_type, duration, price, discount_price, departure_city,
            airline, hotel_mekah, hotel_madinah, hotel_rating, distance_haram, meals_included,
            tour_guide, visa_assistance, vaccination_assistance, transport_type, group_size,
            availability, rating, reviews_count, featured, best_seller, images, included_features
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            u.name, u.description, u.package_type, u.duration, u.price, u.discount_price, u.departure_city,
            u.airline, u.hotel_mekah, u.hotel_madinah, u.hotel_rating, u.distance_haram, u.meals_included,
            u.tour_guide, u.visa_assistance, u.vaccination_assistance, u.transport_type, u.group_size,
            u.availability, u.rating, u.reviews_count, u.featured, u.best_seller, u.images, u.included_features
          ]
        );
      }
      console.log('Umrah packages seeded successfully');
    }

    const existingHaji = await dbAll("SELECT id FROM haji_packages LIMIT 1");
    if (existingHaji.length === 0) {
      const hajiList = [
        {
          name: "Paket Haji Furoda Mujamalah (Langsung Berangkat)",
          description: "Haji resmi dengan visa Mujamalah dari Kerajaan Arab Saudi tanpa antre tahunan, fasilitas maktab VIP Arafah-Mina ber-AC dan hotel bintang 5.",
          quota_year: "1446H / 2025M",
          price: 295000000,
          discount_price: 285000000,
          payment_terms: "DP $5.000 USD saat pendaftaran, pelunasan setelah visa Furoda terbit resmi.",
          included_features: JSON.stringify([
            "Visa Haji Furoda Resmi Kerajaan Saudi",
            "Tenda Maktab VIP Arafah & Mina Full AC",
            "Hotel Bintang 5 Makkah & Madinah Depan Masjid",
            "Penerbangan Direct Saudia Airlines",
            "Bimbingan Manasik Intensif bersama Ulama Nasional",
            "Full Layanan Medis 24 Jam & Dokter Pribadi Rombongan"
          ]),
          images: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
          featured: 1,
          available_quota: 15,
          training_sessions: 8,
          medical_facility: 1,
          rating: 5.0,
          reviews_count: 85
        },
        {
          name: "Paket Haji Plus Khusus Kemenag RI",
          description: "Program Haji Khusus dengan kuota resmi Kementerian Agama RI dengan masa tunggu relatif singkat (5-7 tahun) dan kenyamanan hotel bintang 5.",
          quota_year: "1446H / 2025M",
          price: 185000000,
          discount_price: 175000000,
          payment_terms: "Setoran awal $4.500 USD untuk nomor porsi Kemenag RI.",
          included_features: JSON.stringify([
            "Nomor Porsi Resmi Haji Khusus Kemenag",
            "Hotel Bintang 5 di Makkah & Madinah",
            "Tenda Maktab Khusus AC di Arafah & Mina",
            "Penerbangan Internasional Garuda / Saudia",
            "Manasik Terstruktur & Pendampingan Ibadah Penuh"
          ]),
          images: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80",
          featured: 0,
          available_quota: 25,
          training_sessions: 6,
          medical_facility: 1,
          rating: 4.9,
          reviews_count: 120
        }
      ];

      for (const h of hajiList) {
        await dbRun(
          `INSERT INTO haji_packages (
            name, description, quota_year, price, discount_price, payment_terms,
            included_features, images, featured, available_quota, training_sessions,
            medical_facility, rating, reviews_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            h.name, h.description, h.quota_year, h.price, h.discount_price, h.payment_terms,
            h.included_features, h.images, h.featured, h.available_quota, h.training_sessions,
            h.medical_facility, h.rating, h.reviews_count
          ]
        );
      }
      console.log('Haji packages seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding umrah/haji data:', error);
  }
}

async function seedPrintingData(): Promise<void> {
  try {
    const existingCats = await dbAll("SELECT id FROM printing_categories LIMIT 1");
    if (existingCats.length > 0) {
      console.log('Printing categories already exist, skipping seeding');
      return;
    }

    const printingCategories = [
      { name: 'Undangan Pernikahan', description: 'Undangan pernikahan hardcover, akrilik, dan softcover mewah', icon: 'FileImage', order_index: 1, is_active: 1 },
      { name: 'Souvenir & Goodie Bag', description: 'Pouch, tumbler, tote bag, dan cinderamata pernikahan', icon: 'ShoppingBag', order_index: 2, is_active: 1 },
      { name: 'Photobook & Album', description: 'Cetak album magazine kenangan pernikahan dan prewedding', icon: 'BookOpen', order_index: 3, is_active: 1 },
      { name: 'Banner & Spanduk', description: 'Banner, backdrop photobooth, dan roll up banner wedding', icon: 'Layout', order_index: 4, is_active: 1 },
      { name: 'Kartu Nama & ID Card', description: 'Kartu nama exclusive dan kartu identitas panitia', icon: 'CreditCard', order_index: 5, is_active: 1 },
      { name: 'Stiker & Label Souvenir', description: 'Stiker label ucapan terima kasih dan seal undangan', icon: 'Tag', order_index: 6, is_active: 1 }
    ];

    for (const c of printingCategories) {
      await dbRun(
        `INSERT INTO printing_categories (name, description, icon, order_index, is_active) VALUES (?, ?, ?, ?, ?)`,
        [c.name, c.description, c.icon, c.order_index, c.is_active]
      );
    }

    const printingProducts = [
      {
        category_id: 1,
        name: 'Undangan Hardcover Floral Gold Foil',
        description: 'Undangan pernikahan hardcover tebal dengan sentuhan hotprint foil emas berkilau dan pita satin mewah.',
        price: 15000,
        discount_price: 12500,
        size_options: '15 x 20 cm, A5 Lipat 2',
        material_options: 'Board 30 + Jasmine Glitter, Art Paper 260gsm Laminasi Doff',
        color_options: 'Gold Champagne, Emerald Green, Navy Blue, Maroon Velvet',
        images: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1200&q=80',
        estimated_time: '5-7 Hari Kerja',
        min_order: 100,
        is_active: 1
      },
      {
        category_id: 1,
        name: 'Undangan Akrilik Transparan Eksklusif (UV Print)',
        description: 'Kemewahan undangan akrilik bening 2mm dengan cetak tinta UV timbul anti air dan amplop beludru premium.',
        price: 35000,
        discount_price: 29000,
        size_options: '15 x 21 cm, 12 x 18 cm',
        material_options: 'Akrilik Bening 2mm, Akrilik Frosted Doff 2mm',
        color_options: 'White Ink, Gold Ink, Full Color UV',
        images: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
        estimated_time: '7-10 Hari Kerja',
        min_order: 50,
        is_active: 1
      },
      {
        category_id: 2,
        name: 'Souvenir Custom & Goodie Bag Pernikahan',
        description: 'Pilihan pouch kulit sintetis, tumbler custom grafir nama, dan tote bag kanvas elegan untuk cinderamata tamu.',
        price: 18000,
        discount_price: 15000,
        size_options: '20 x 12 cm, Standard Pouch',
        material_options: 'Kulit Sintetis Premium, Kanvas Tebal, Stainless 500ml',
        color_options: 'Havana Brown, Black Onyx, Sage Green, Dusty Pink',
        images: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80',
        estimated_time: '7-14 Hari Kerja',
        min_order: 100,
        is_active: 1
      },
      {
        category_id: 3,
        name: 'Wedding Photobook Magazine (Album Kenangan)',
        description: 'Cetak album foto kenangan wedding & prewedding gaya majalah luxury dengan kertas tebal anti air.',
        price: 450000,
        discount_price: 380000,
        size_options: '20 x 30 cm (A4 Landscape), 30 x 30 cm Square',
        material_options: 'Luster Photo Paper 260gsm, Silk Matte Paper',
        color_options: 'Full Color HD Print',
        images: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
        estimated_time: '3-5 Hari Kerja',
        min_order: 1,
        is_active: 1
      },
      {
        category_id: 4,
        name: 'Banner & Backdrop Wedding Photobooth 3x2m',
        description: 'Backdrop photobooth dan welcome banner cetak resolusi tinggi warna tajam dan tidak memantulkan cahaya blitz foto.',
        price: 90000,
        discount_price: 65000,
        size_options: '3 x 2 Meter, 2 x 2 Meter, 1 x 2 Meter',
        material_options: 'Korea Matte Flexi 440gsm, Jerman Doff 510gsm',
        color_options: 'Full Color Hi-Res',
        images: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
        estimated_time: '1-2 Hari Kerja',
        min_order: 1,
        is_active: 1
      }
    ];

    for (const p of printingProducts) {
      await dbRun(
        `INSERT INTO printing_products (category_id, name, description, price, discount_price, size_options, material_options, color_options, images, estimated_time, min_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.category_id, p.name, p.description, p.price, p.discount_price, p.size_options, p.material_options, p.color_options, p.images, p.estimated_time, p.min_order, p.is_active]
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
      if (!useTurso()) {
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