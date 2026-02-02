import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";
import { TestimonialItem, CreateTestimonialItem, UpdateTestimonialItem, ApiResponse, ListResponse } from "../../shared/api";

// Get all testimonials
export const getTestimonials: RequestHandler = async (req, res) => {
  try {
    const items = await dbAll("SELECT * FROM testimonials ORDER BY createdAt DESC");
    const response: ListResponse<TestimonialItem> = {
      success: true,
      data: items,
      total: items.length
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch testimonials' });
  }
};

// Get single testimonial
export const getTestimonial: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await dbGet("SELECT * FROM testimonials WHERE id = ?", [id]);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Testimonial not found' });
    }

    const response: ApiResponse<TestimonialItem> = {
      success: true,
      data: item
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch testimonial' });
  }
};

// Create testimonial
export const createTestimonial: RequestHandler = async (req, res) => {
  try {
    const { name, text, rating, date }: CreateTestimonialItem = req.body;

    if (!name || !text || rating === undefined || !date) {
      return res.status(400).json({ success: false, error: 'Name, text, rating, and date are required' });
    }

    const result = await dbRun(
      "INSERT INTO testimonials (name, text, rating, date) VALUES (?, ?, ?, ?)",
      [name, text, rating, date]
    );

    const newItem = await dbGet("SELECT * FROM testimonials WHERE id = ?", [result.lastID]);

    const response: ApiResponse<TestimonialItem> = {
      success: true,
      data: newItem,
      message: 'Testimonial created successfully'
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ success: false, error: 'Failed to create testimonial' });
  }
};

// Update testimonial
export const updateTestimonial: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdateTestimonialItem = req.body;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM testimonials WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Testimonial not found' });
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];

    if (updates.name !== undefined) {
      updateFields.push("name = ?");
      values.push(updates.name);
    }
    if (updates.text !== undefined) {
      updateFields.push("text = ?");
      values.push(updates.text);
    }
    if (updates.rating !== undefined) {
      updateFields.push("rating = ?");
      values.push(updates.rating);
    }
    if (updates.date !== undefined) {
      updateFields.push("date = ?");
      values.push(updates.date);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updateFields.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    await dbRun(
      `UPDATE testimonials SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    const updatedItem = await dbGet("SELECT * FROM testimonials WHERE id = ?", [id]);

    const response: ApiResponse<TestimonialItem> = {
      success: true,
      data: updatedItem,
      message: 'Testimonial updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ success: false, error: 'Failed to update testimonial' });
  }
};

// Delete testimonial
export const deleteTestimonial: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM testimonials WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Testimonial not found' });
    }

    await dbRun("DELETE FROM testimonials WHERE id = ?", [id]);

    res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ success: false, error: 'Failed to delete testimonial' });
  }
};
