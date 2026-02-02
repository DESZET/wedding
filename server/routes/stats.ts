import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";
import { StatItem, CreateStatItem, UpdateStatItem, ApiResponse, ListResponse } from "../../shared/api";

// Get all stats
export const getStats: RequestHandler = async (req, res) => {
  try {
    const items = await dbAll("SELECT * FROM stats ORDER BY createdAt DESC");
    const response: ListResponse<StatItem> = {
      success: true,
      data: items,
      total: items.length
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};

// Get single stat
export const getStat: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await dbGet("SELECT * FROM stats WHERE id = ?", [id]);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Stat not found' });
    }

    const response: ApiResponse<StatItem> = {
      success: true,
      data: item
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching stat:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stat' });
  }
};

// Create stat
export const createStat: RequestHandler = async (req, res) => {
  try {
    const { label, value }: CreateStatItem = req.body;

    if (!label || value === undefined) {
      return res.status(400).json({ success: false, error: 'Label and value are required' });
    }

    const result = await dbRun(
      "INSERT INTO stats (label, value) VALUES (?, ?)",
      [label, value]
    );

    const newItem = await dbGet("SELECT * FROM stats WHERE id = ?", [result.lastID]);

    const response: ApiResponse<StatItem> = {
      success: true,
      data: newItem,
      message: 'Stat created successfully'
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating stat:', error);
    res.status(500).json({ success: false, error: 'Failed to create stat' });
  }
};

// Update stat
export const updateStat: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdateStatItem = req.body;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM stats WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Stat not found' });
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];

    if (updates.label !== undefined) {
      updateFields.push("label = ?");
      values.push(updates.label);
    }
    if (updates.value !== undefined) {
      updateFields.push("value = ?");
      values.push(updates.value);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updateFields.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    await dbRun(
      `UPDATE stats SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    const updatedItem = await dbGet("SELECT * FROM stats WHERE id = ?", [id]);

    const response: ApiResponse<StatItem> = {
      success: true,
      data: updatedItem,
      message: 'Stat updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating stat:', error);
    res.status(500).json({ success: false, error: 'Failed to update stat' });
  }
};

// Delete stat
export const deleteStat: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM stats WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Stat not found' });
    }

    await dbRun("DELETE FROM stats WHERE id = ?", [id]);

    res.json({ success: true, message: 'Stat deleted successfully' });
  } catch (error) {
    console.error('Error deleting stat:', error);
    res.status(500).json({ success: false, error: 'Failed to delete stat' });
  }
};
