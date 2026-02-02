import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";
import { GalleryItem, CreateGalleryItem, UpdateGalleryItem, ApiResponse, ListResponse } from "../../shared/api";

// Get all gallery items
export const getGallery: RequestHandler = async (req, res) => {
  try {
    const items = await dbAll("SELECT * FROM gallery ORDER BY createdAt DESC");
    const response: ListResponse<GalleryItem> = {
      success: true,
      data: items,
      total: items.length
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch gallery items' });
  }
};

// Get single gallery item
export const getGalleryItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await dbGet("SELECT * FROM gallery WHERE id = ?", [id]);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }

    const response: ApiResponse<GalleryItem> = {
      success: true,
      data: item
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching gallery item:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch gallery item' });
  }
};

// Create gallery item
export const createGalleryItem: RequestHandler = async (req, res) => {
  try {
    const { title, category, image }: CreateGalleryItem = req.body;

    if (!title || !category || !image) {
      return res.status(400).json({ success: false, error: 'Title, category, and image are required' });
    }

    const result = await dbRun(
      "INSERT INTO gallery (title, category, image) VALUES (?, ?, ?)",
      [title, category, image]
    );

    const newItem = await dbGet("SELECT * FROM gallery WHERE id = ?", [result.lastID]);

    const response: ApiResponse<GalleryItem> = {
      success: true,
      data: newItem,
      message: 'Gallery item created successfully'
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating gallery item:', error);
    res.status(500).json({ success: false, error: 'Failed to create gallery item' });
  }
};

// Update gallery item
export const updateGalleryItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdateGalleryItem = req.body;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM gallery WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];

    if (updates.title !== undefined) {
      updateFields.push("title = ?");
      values.push(updates.title);
    }
    if (updates.category !== undefined) {
      updateFields.push("category = ?");
      values.push(updates.category);
    }
    if (updates.image !== undefined) {
      updateFields.push("image = ?");
      values.push(updates.image);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updateFields.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    await dbRun(
      `UPDATE gallery SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    const updatedItem = await dbGet("SELECT * FROM gallery WHERE id = ?", [id]);

    const response: ApiResponse<GalleryItem> = {
      success: true,
      data: updatedItem,
      message: 'Gallery item updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating gallery item:', error);
    res.status(500).json({ success: false, error: 'Failed to update gallery item' });
  }
};

// Delete gallery item
export const deleteGalleryItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM gallery WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }

    await dbRun("DELETE FROM gallery WHERE id = ?", [id]);

    res.json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ success: false, error: 'Failed to delete gallery item' });
  }
};
