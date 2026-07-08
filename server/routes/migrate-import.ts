import { RequestHandler } from "express";
import { dbRun } from "../database";

const ALL_TABLES = [
  "religious_bookings",
  "printing_orders",
  "customer_debts",
  "printing_products",
  "printing_packages",
  "printing_categories",
  "customer_debts",
  "customers",
  "wedding_show_videos",
  "videos",
  "section_images",
  "stats",
  "venues",
  "service_faqs",
  "haji_packages",
  "umrah_packages",
  "packages",
  "testimonials",
  "gallery",
  "settings",
  "admin_credentials",
];

export const migrateReset: RequestHandler = async (req, res) => {
  try {
    const { secret } = req.body;
    if (!secret || secret !== process.env.MIGRATE_SECRET) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    await dbRun("PRAGMA foreign_keys = OFF");
    for (const table of ALL_TABLES) {
      await dbRun(`DELETE FROM "${table}"`);
    }
    await dbRun("PRAGMA foreign_keys = ON");

    res.json({ success: true, message: "All tables cleared" });
  } catch (error) {
    console.error("migrate-reset error:", error);
    res.status(500).json({ success: false, error: String(error) });
  }
};

export const migrateImport: RequestHandler = async (req, res) => {
  try {
    const { secret, table, rows, truncate } = req.body;

    if (!secret || secret !== process.env.MIGRATE_SECRET) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (!table || !Array.isArray(rows)) {
      return res.status(400).json({ success: false, error: "Invalid payload" });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
      return res.status(400).json({ success: false, error: "Invalid table name" });
    }

    if (truncate) {
      await dbRun("PRAGMA foreign_keys = OFF");
      await dbRun(`DELETE FROM "${table}"`);
    }

    if (rows.length === 0) {
      return res.json({ success: true, table, count: 0 });
    }

    const columns = Object.keys(rows[0]);
    const colList = columns.map((c) => `"${c}"`).join(", ");
    const placeholders = columns.map(() => "?").join(", ");
    const insertSql = `INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`;

    for (const row of rows) {
      const values = columns.map((c) => row[c] ?? null);
      await dbRun(insertSql, values);
    }

    res.json({ success: true, table, count: rows.length });
  } catch (error) {
    console.error("migrate-import error:", error);
    res.status(500).json({ success: false, error: String(error) });
  }
};
