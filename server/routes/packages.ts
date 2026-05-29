import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";
import { PackageItem, CreatePackageItem, UpdatePackageItem, ApiResponse, ListResponse } from "../../shared/api";

// Get all packages
export const getPackages: RequestHandler = async (req, res) => {
  try {
    const items = await dbAll("SELECT * FROM packages ORDER BY createdAt DESC");
    
    // Parse features JSON for each package
    const parsedItems = items.map((item: any) => ({
      ...item,
      features: item.features ? JSON.parse(item.features) : []
    }));
    
    const response: ListResponse<PackageItem> = {
      success: true,
      data: parsedItems,
      total: parsedItems.length
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch packages' });
  }
};

// Get single package
export const getPackage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await dbGet("SELECT * FROM packages WHERE id = ?", [id]);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }

    // Parse features JSON
    const parsedItem = {
      ...item,
      features: item.features ? JSON.parse(item.features) : []
    };

    const response: ApiResponse<PackageItem> = {
      success: true,
      data: parsedItem
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch package' });
  }
};

// Create package
export const createPackage: RequestHandler = async (req, res) => {
  try {
    const { name, price, description, highlighted, longDescription, features }: CreatePackageItem = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, error: 'Name and price are required' });
    }

    // Convert features array to JSON string if provided
    const featuresJson = features ? JSON.stringify(features) : null;

    const result = await dbRun(
      "INSERT INTO packages (name, price, description, highlighted, longDescription, features) VALUES (?, ?, ?, ?, ?, ?)",
      [name, price, description || '', highlighted ? 1 : 0, longDescription || '', featuresJson]
    );

    const newItem = await dbGet("SELECT * FROM packages WHERE id = ?", [result.lastID]);

    // Parse features JSON for response
    const parsedNewItem = {
      ...newItem,
      features: newItem.features ? JSON.parse(newItem.features) : []
    };

    const response: ApiResponse<PackageItem> = {
      success: true,
      data: parsedNewItem,
      message: 'Package created successfully'
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({ success: false, error: 'Failed to create package' });
  }
};

// Update package
export const updatePackage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdatePackageItem = req.body;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM packages WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];

    if (updates.name !== undefined) {
      updateFields.push("name = ?");
      values.push(updates.name);
    }
    if (updates.price !== undefined) {
      updateFields.push("price = ?");
      values.push(updates.price);
    }
    if (updates.description !== undefined) {
      updateFields.push("description = ?");
      values.push(updates.description);
    }
    if (updates.highlighted !== undefined) {
      updateFields.push("highlighted = ?");
      values.push(updates.highlighted ? 1 : 0);
    }
    if (updates.longDescription !== undefined) {
      updateFields.push("longDescription = ?");
      values.push(updates.longDescription);
    }
    if (updates.features !== undefined) {
      updateFields.push("features = ?");
      values.push(JSON.stringify(updates.features));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updateFields.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    await dbRun(
      `UPDATE packages SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    const updatedItem = await dbGet("SELECT * FROM packages WHERE id = ?", [id]);

    // Parse features JSON for response
    const parsedUpdatedItem = {
      ...updatedItem,
      features: updatedItem.features ? JSON.parse(updatedItem.features) : []
    };

    const response: ApiResponse<PackageItem> = {
      success: true,
      data: parsedUpdatedItem,
      message: 'Package updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({ success: false, error: 'Failed to update package' });
  }
};

// Delete package
export const deletePackage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM packages WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }

    await dbRun("DELETE FROM packages WHERE id = ?", [id]);

    res.json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({ success: false, error: 'Failed to delete package' });
  }
};
