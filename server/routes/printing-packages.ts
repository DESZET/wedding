import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";
import { ApiResponse, ListResponse } from "../../shared/api";

interface PrintingPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  discount_price: number;
  category: string;
  included_items: string[];
  max_products: number;
  validity_days: number;
  is_active: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get all printing packages
export const getPrintingPackages: RequestHandler = async (req, res) => {
  try {
    const { category, is_active } = req.query;
    let query = "SELECT * FROM printing_packages ORDER BY createdAt DESC";
    let params: any[] = [];

    if (category) {
      query = "SELECT * FROM printing_packages WHERE category = ? ORDER BY createdAt DESC";
      params = [category];
    } else if (is_active !== undefined) {
      query = "SELECT * FROM printing_packages WHERE is_active = ? ORDER BY createdAt DESC";
      params = [is_active === 'true' ? 1 : 0];
    }

    const items = await dbAll(query, params);
    const response: ListResponse<PrintingPackage> = {
      success: true,
      data: items,
      total: items.length
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching printing packages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch printing packages' });
  }
};

// Get single printing package
export const getPrintingPackage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await dbGet("SELECT * FROM printing_packages WHERE id = ?", [id]);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Printing package not found' });
    }

    const response: ApiResponse<PrintingPackage> = {
      success: true,
      data: item
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching printing package:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch printing package' });
  }
};

// Create printing package
export const createPrintingPackage: RequestHandler = async (req, res) => {
  try {
    const packageData: Partial<PrintingPackage> = req.body;

    if (!packageData.name || !packageData.price) {
      return res.status(400).json({ success: false, error: 'Name and price are required' });
    }

    const result = await dbRun(
      `INSERT INTO printing_packages (
        name, description, price, discount_price, category, included_items,
        max_products, validity_days, is_active, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        packageData.name,
        packageData.description || '',
        packageData.price,
        packageData.discount_price || null,
        packageData.category || 'general',
        JSON.stringify(packageData.included_items || []),
        packageData.max_products || 0,
        packageData.validity_days || 30,
        packageData.is_active !== false ? 1 : 0,
        packageData.featured ? 1 : 0
      ]
    );

    const newItem = await dbGet("SELECT * FROM printing_packages WHERE id = ?", [result.lastID]);

    const response: ApiResponse<PrintingPackage> = {
      success: true,
      data: newItem,
      message: 'Printing package created successfully'
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating printing package:', error);
    res.status(500).json({ success: false, error: 'Failed to create printing package' });
  }
};

// Update printing package
export const updatePrintingPackage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: Partial<PrintingPackage> = req.body;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM printing_packages WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Printing package not found' });
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
    if (updates.price !== undefined) {
      updateFields.push("price = ?");
      values.push(updates.price);
    }
    if (updates.discount_price !== undefined) {
      updateFields.push("discount_price = ?");
      values.push(updates.discount_price);
    }
    if (updates.category !== undefined) {
      updateFields.push("category = ?");
      values.push(updates.category);
    }
    if (updates.included_items !== undefined) {
      updateFields.push("included_items = ?");
      values.push(JSON.stringify(updates.included_items));
    }
    if (updates.max_products !== undefined) {
      updateFields.push("max_products = ?");
      values.push(updates.max_products);
    }
    if (updates.validity_days !== undefined) {
      updateFields.push("validity_days = ?");
      values.push(updates.validity_days);
    }
    if (updates.is_active !== undefined) {
      updateFields.push("is_active = ?");
      values.push(updates.is_active ? 1 : 0);
    }
    if (updates.featured !== undefined) {
      updateFields.push("featured = ?");
      values.push(updates.featured ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updateFields.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    await dbRun(
      `UPDATE printing_packages SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    const updatedItem = await dbGet("SELECT * FROM printing_packages WHERE id = ?", [id]);

    const response: ApiResponse<PrintingPackage> = {
      success: true,
      data: updatedItem,
      message: 'Printing package updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating printing package:', error);
    res.status(500).json({ success: false, error: 'Failed to update printing package' });
  }
};

// Delete printing package
export const deletePrintingPackage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM printing_packages WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Printing package not found' });
    }

    await dbRun("DELETE FROM printing_packages WHERE id = ?", [id]);

    res.json({ success: true, message: 'Printing package deleted successfully' });
  } catch (error) {
    console.error('Error deleting printing package:', error);
    res.status(500).json({ success: false, error: 'Failed to delete printing package' });
  }
};
