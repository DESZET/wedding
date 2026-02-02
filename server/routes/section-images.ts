import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";
import { SectionImageItem, CreateSectionImageItem, UpdateSectionImageItem, ApiResponse, ListResponse } from "../../shared/api";

// Get all section images
export const getSectionImages: RequestHandler = async (req, res) => {
  try {
    const items = await dbAll("SELECT * FROM section_images ORDER BY order_index ASC");
    const response: ListResponse<SectionImageItem> = {
      success: true,
      data: items,
      total: items.length
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching section images:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch section images' });
  }
};

// Get single section image
export const getSectionImage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await dbGet("SELECT * FROM section_images WHERE id = ?", [id]);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Section image not found' });
    }

    const response: ApiResponse<SectionImageItem> = {
      success: true,
      data: item
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching section image:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch section image' });
  }
};

// Create section image
export const createSectionImage: RequestHandler = async (req, res) => {
  try {
    const { section, image_url, alt_text, order_index, is_active }: CreateSectionImageItem = req.body;

    if (!section || !image_url) {
      return res.status(400).json({ success: false, error: 'Section and image_url are required' });
    }

    const result = await dbRun(
      "INSERT INTO section_images (section, image_url, alt_text, order_index, is_active) VALUES (?, ?, ?, ?, ?)",
      [section, image_url, alt_text || null, order_index || 0, is_active !== undefined ? is_active : true]
    );

    const newItem = await dbGet("SELECT * FROM section_images WHERE id = ?", [result.lastID]);

    const response: ApiResponse<SectionImageItem> = {
      success: true,
      data: newItem,
      message: 'Section image created successfully'
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating section image:', error);
    res.status(500).json({ success: false, error: 'Failed to create section image' });
  }
};

// Update section image
export const updateSectionImage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdateSectionImageItem = req.body;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM section_images WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Section image not found' });
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];

    if (updates.section !== undefined) {
      updateFields.push("section = ?");
      values.push(updates.section);
    }
    if (updates.image_url !== undefined) {
      updateFields.push("image_url = ?");
      values.push(updates.image_url);
    }
    if (updates.alt_text !== undefined) {
      updateFields.push("alt_text = ?");
      values.push(updates.alt_text);
    }
    if (updates.order_index !== undefined) {
      updateFields.push("order_index = ?");
      values.push(updates.order_index);
    }
    if (updates.is_active !== undefined) {
      updateFields.push("is_active = ?");
      values.push(updates.is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updateFields.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    await dbRun(
      `UPDATE section_images SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    const updatedItem = await dbGet("SELECT * FROM section_images WHERE id = ?", [id]);

    const response: ApiResponse<SectionImageItem> = {
      success: true,
      data: updatedItem,
      message: 'Section image updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating section image:', error);
    res.status(500).json({ success: false, error: 'Failed to update section image' });
  }
};

// Delete section image
export const deleteSectionImage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM section_images WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Section image not found' });
    }

    await dbRun("DELETE FROM section_images WHERE id = ?", [id]);

    res.json({ success: true, message: 'Section image deleted successfully' });
  } catch (error) {
    console.error('Error deleting section image:', error);
    res.status(500).json({ success: false, error: 'Failed to delete section image' });
  }
};
