import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";

// GET /api/printing/reviews/:productId
export const getProductReviews: RequestHandler = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await dbAll(
      "SELECT * FROM printing_reviews WHERE product_id = ? ORDER BY createdAt DESC",
      [productId]
    );
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, error: "Failed to fetch reviews" });
  }
};

// POST /api/printing/reviews
export const createProductReview: RequestHandler = async (req, res) => {
  try {
    const { product_id, name, rating, comment } = req.body;

    if (!product_id || !name || !rating) {
      return res.status(400).json({ success: false, error: "product_id, name, dan rating wajib diisi" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: "Rating harus antara 1-5" });
    }

    // Pastikan produk ada
    const product = await dbGet("SELECT id FROM printing_products WHERE id = ?", [product_id]);
    if (!product) {
      return res.status(404).json({ success: false, error: "Produk tidak ditemukan" });
    }

    // Insert review
    const result = await dbRun(
      "INSERT INTO printing_reviews (product_id, name, rating, comment) VALUES (?, ?, ?, ?)",
      [product_id, name.trim(), Number(rating), comment?.trim() || ""]
    );

    // Update avg rating dan reviews_count di produk
    const stats = await dbGet(
      "SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM printing_reviews WHERE product_id = ?",
      [product_id]
    );
    const avgRating = Math.round((Number(stats.avg_rating) || 0) * 10) / 10;
    const total = Number(stats.total) || 0;

    await dbRun(
      "UPDATE printing_products SET rating = ?, reviews_count = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [avgRating, total, product_id]
    );

    const newReview = await dbGet("SELECT * FROM printing_reviews WHERE id = ?", [result.lastID]);
    res.status(201).json({ success: true, data: newReview, message: "Review berhasil ditambahkan" });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ success: false, error: "Gagal menambahkan review" });
  }
};

// DELETE /api/printing/reviews/:id  (admin only - no auth for now)
export const deleteProductReview: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await dbGet("SELECT * FROM printing_reviews WHERE id = ?", [id]);
    if (!review) {
      return res.status(404).json({ success: false, error: "Review tidak ditemukan" });
    }

    await dbRun("DELETE FROM printing_reviews WHERE id = ?", [id]);

    // Recalculate rating after delete
    const stats = await dbGet(
      "SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM printing_reviews WHERE product_id = ?",
      [review.product_id]
    );
    const avgRating = Math.round((Number(stats?.avg_rating) || 0) * 10) / 10;
    const total = Number(stats?.total) || 0;

    await dbRun(
      "UPDATE printing_products SET rating = ?, reviews_count = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [avgRating, total, review.product_id]
    );

    res.json({ success: true, message: "Review dihapus" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ success: false, error: "Gagal menghapus review" });
  }
};
