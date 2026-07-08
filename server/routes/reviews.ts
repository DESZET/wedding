import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";

type ReviewType = "printing" | "umrah" | "wedding";

const TABLE: Record<ReviewType, string> = {
  printing: "printing_reviews",
  umrah: "umrah_reviews",
  wedding: "wedding_reviews",
};

const PRODUCT_TABLE: Record<ReviewType, string> = {
  printing: "printing_products",
  umrah: "umrah_packages",
  wedding: "packages",
};

// GET /api/reviews/:type/:itemId
export const getReviews: RequestHandler = async (req, res) => {
  try {
    const type = req.params.type as ReviewType;
    const { itemId } = req.params;

    if (!TABLE[type]) return res.status(400).json({ success: false, error: "Invalid review type" });

    const reviews = await dbAll(
      `SELECT * FROM ${TABLE[type]} WHERE ${type === "printing" ? "product_id" : "package_id"} = ? ORDER BY createdAt DESC`,
      [itemId]
    );

    // Hitung stats
    const total = reviews.length;
    const avg =
      total > 0
        ? Math.round((reviews.reduce((s: number, r: any) => s + Number(r.rating), 0) / total) * 10) / 10
        : 0;

    res.json({ success: true, data: reviews, stats: { avg, total } });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, error: "Failed to fetch reviews" });
  }
};

// POST /api/reviews/:type
export const createReview: RequestHandler = async (req, res) => {
  try {
    const type = req.params.type as ReviewType;
    if (!TABLE[type]) return res.status(400).json({ success: false, error: "Invalid review type" });

    const { item_id, name, rating, comment, avatar_url, google_id } = req.body;

    if (item_id === undefined || item_id === null || !name?.trim() || !rating) {
      return res.status(400).json({ success: false, error: "item_id, name, dan rating wajib diisi" });
    }
    const r = Number(rating);
    if (r < 1 || r > 5) {
      return res.status(400).json({ success: false, error: "Rating harus 1–5" });
    }

    // Pastikan item ada (skip validasi untuk item_id=0 = general service review)
    if (Number(item_id) !== 0) {
      const item = await dbGet(`SELECT id FROM ${PRODUCT_TABLE[type]} WHERE id = ?`, [item_id]);
      if (!item) return res.status(404).json({ success: false, error: "Item tidak ditemukan" });
    }

    const col = type === "printing" ? "product_id" : "package_id";

    await dbRun(
      `INSERT INTO ${TABLE[type]} (${col}, name, rating, comment, avatar_url, google_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [item_id, name.trim(), r, comment?.trim() || "", avatar_url || null, google_id || null]
    );

    // Update avg rating di tabel produk/paket (jika ada kolom rating & reviews_count)
    let avgRating = 0;
    let total = 0;
    try {
      const allReviews = await dbAll(
        `SELECT rating FROM ${TABLE[type]} WHERE ${col} = ?`,
        [item_id]
      );
      total = allReviews.length;
      avgRating = total > 0
        ? Math.round((allReviews.reduce((s: number, rv: any) => s + Number(rv.rating), 0) / total) * 10) / 10
        : 0;

      if (type === "printing" && Number(item_id) !== 0) {
        await dbRun(
          "UPDATE printing_products SET rating = ?, reviews_count = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
          [avgRating, total, item_id]
        );
      } else if (type === "umrah" && Number(item_id) !== 0) {
        await dbRun(
          "UPDATE umrah_packages SET rating = ?, reviews_count = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
          [avgRating, total, item_id]
        );
      }
    } catch (statsErr) {
      // Non-fatal — jangan gagalkan insert hanya karena update stats error
      console.error("Error updating stats:", statsErr);
    }

    res.status(201).json({ success: true, message: "Review berhasil ditambahkan", stats: { avg: avgRating, total } });
  } catch (error) {
    console.error("Error creating review:", error);
    const msg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: "Gagal menambahkan review", detail: msg });
  }
};

// DELETE /api/reviews/:type/:id  (admin)
export const deleteReview: RequestHandler = async (req, res) => {
  try {
    const type = req.params.type as ReviewType;
    const { id } = req.params;
    if (!TABLE[type]) return res.status(400).json({ success: false, error: "Invalid review type" });

    const review = await dbGet(`SELECT * FROM ${TABLE[type]} WHERE id = ?`, [id]);
    if (!review) return res.status(404).json({ success: false, error: "Review tidak ditemukan" });

    await dbRun(`DELETE FROM ${TABLE[type]} WHERE id = ?`, [id]);

    res.json({ success: true, message: "Review dihapus" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ success: false, error: "Gagal menghapus review" });
  }
};
