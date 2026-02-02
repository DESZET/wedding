import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

// Database connection
let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getDb(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (!db) {
    db = await open({
      filename: 'wedding.db',
      driver: sqlite3.Database,
    });
  }
  return db;
}

// Helper functions
export async function dbRun(sql: string, params: any[] = []): Promise<any> {
  const database = await getDb();
  return database.run(sql, params);
}

export async function dbGet<T = any>(sql: string, params: any[] = []): Promise<T> {
  const database = await getDb();
  return database.get(sql, params);
}

export async function dbAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const database = await getDb();
  return database.all(sql, params);
}

// Initialize database
export async function initDatabase(): Promise<void> {
  try {
    // Gallery table
    await dbRun(`
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
    await dbRun(`
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

    // Packages table
    await dbRun(`
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

    // Venues table
    await dbRun(`
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
    await dbRun(`
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
    await dbRun(`
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
    await dbRun(`
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

    // Wedding Show Videos table (simpler than regular videos - no title/description)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS wedding_show_videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        videoPath TEXT NOT NULL,
        thumbnail TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
