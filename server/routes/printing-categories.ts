import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";
import { ApiResponse, ListResponse } from "../../shared/api";

interface PrintingCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  order_index: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get all printing categories
export const getPrintingCategories: RequestHandler = async (req, res) => {
  try {
    const items = await dbAll("SELECT * FROM printing_categories ORDER BY order_index ASC, createdAt DESC");
    const response: ListResponse<PrintingCategory> = {
      success: true,
      data: items,
      total: items.length
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching printing categories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch printing categories' });
  }
};

// Get single printing category
export const getPrintingCategory: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await dbGet("SELECT * FROM printing_categories WHERE id = ?", [id]);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Printing category not found' });
    }

    const response: ApiResponse<PrintingCategory> = {
      success: true,
      data: item
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching printing category:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch printing category' });
  }
};

// Create printing category
export const createPrintingCategory: RequestHandler = async (req, res) => {
  try {
    const { name, description, icon, order_index, is_active }: Partial<PrintingCategory> = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const result = await dbRun(
      "INSERT INTO printing_categories (name, description, icon, order_index, is_active) VALUES (?, ?, ?, ?, ?)",
      [name, description || '', icon || '', order_index || 0, is_active ? 1 : 0]
    );

    const newItem = await dbGet("SELECT * FROM printing_categories WHERE id = ?", [result.lastID]);

    const response: ApiResponse<PrintingCategory> = {
      success: true,
      data: newItem,
      message: 'Printing category created successfully'
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating printing category:', error);
    res.status(500).json({ success: false, error: 'Failed to create printing category' });
  }
};

// Update printing category
export const updatePrintingCategory: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: Partial<PrintingCategory> = req.body;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM printing_categories WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Printing category not found' });
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];

    if (updates.name !== undefined) {
      updateFields.push("name = ?");
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      updateFields.push("description = ?");
      values.push(updates.description);
    }
    if (updates.icon !== undefined) {
      updateFields.push("icon = ?");
      values.push(updates.icon);
    }
    if (updates.order_index !== undefined) {
      updateFields.push("order_index = ?");
      values.push(updates.order_index);
    }
    if (updates.is_active !== undefined) {
      updateFields.push("is_active = ?");
      values.push(updates.is_active ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updateFields.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    await dbRun(
      `UPDATE printing_categories SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    const updatedItem = await dbGet("SELECT * FROM printing_categories WHERE id = ?", [id]);

    const response: ApiResponse<PrintingCategory> = {
      success: true,
      data: updatedItem,
      message: 'Printing category updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating printing category:', error);
    res.status(500).json({ success: false, error: 'Failed to update printing category' });
  }
};

// Delete printing category
export const deletePrintingCategory: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM printing_categories WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Printing category not found' });
    }

    await dbRun("DELETE FROM printing_categories WHERE id = ?", [id]);

    res.json({ success: true, message: 'Printing category deleted successfully' });
  } catch (error) {
    console.error('Error deleting printing category:', error);
    res.status(500).json({ success: false, error: 'Failed to delete printing category' });
  }
};
