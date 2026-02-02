import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";
import { VenueItem, CreateVenueItem, UpdateVenueItem, ApiResponse, ListResponse } from "../../shared/api";

// Get all venues
export const getVenues: RequestHandler = async (req, res) => {
  try {
    const items = await dbAll("SELECT * FROM venues ORDER BY createdAt DESC");
    const response: ListResponse<VenueItem> = {
      success: true,
      data: items,
      total: items.length
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch venues' });
  }
};

// Get single venue
export const getVenue: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await dbGet("SELECT * FROM venues WHERE id = ?", [id]);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Venue not found' });
    }

    const response: ApiResponse<VenueItem> = {
      success: true,
      data: item
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching venue:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch venue' });
  }
};

// Create venue
export const createVenue: RequestHandler = async (req, res) => {
  try {
    const { title, category, price, capacity, description }: CreateVenueItem = req.body;

    if (!title || !category || !price) {
      return res.status(400).json({ success: false, error: 'Title, category, and price are required' });
    }

    const result = await dbRun(
      "INSERT INTO venues (title, category, price, capacity, description) VALUES (?, ?, ?, ?, ?)",
      [title, category, price, capacity, description]
    );

    const newItem = await dbGet("SELECT * FROM venues WHERE id = ?", [result.lastID]);

    const response: ApiResponse<VenueItem> = {
      success: true,
      data: newItem,
      message: 'Venue created successfully'
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({ success: false, error: 'Failed to create venue' });
  }
};

// Update venue
export const updateVenue: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdateVenueItem = req.body;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM venues WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Venue not found' });
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
    if (updates.price !== undefined) {
      updateFields.push("price = ?");
      values.push(updates.price);
    }
    if (updates.capacity !== undefined) {
      updateFields.push("capacity = ?");
      values.push(updates.capacity);
    }
    if (updates.description !== undefined) {
      updateFields.push("description = ?");
      values.push(updates.description);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updateFields.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    await dbRun(
      `UPDATE venues SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    const updatedItem = await dbGet("SELECT * FROM venues WHERE id = ?", [id]);

    const response: ApiResponse<VenueItem> = {
      success: true,
      data: updatedItem,
      message: 'Venue updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating venue:', error);
    res.status(500).json({ success: false, error: 'Failed to update venue' });
  }
};

// Delete venue
export const deleteVenue: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM venues WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Venue not found' });
    }

    await dbRun("DELETE FROM venues WHERE id = ?", [id]);

    res.json({ success: true, message: 'Venue deleted successfully' });
  } catch (error) {
    console.error('Error deleting venue:', error);
    res.status(500).json({ success: false, error: 'Failed to delete venue' });
  }
};
