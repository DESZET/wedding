import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";
import { PackageItem, CreatePackageItem, UpdatePackageItem, ApiResponse, ListResponse } from "../../shared/api";

const parseSafeJson = (str: any, fallback: any = []) => {
  if (!str) return fallback;
  if (Array.isArray(str)) return str;
  try {
    return JSON.parse(str);
  } catch {
    if (typeof str === 'string') {
      const trimmed = str.trim();
      if (!trimmed) return fallback;
      if (trimmed.startsWith('data:')) return [trimmed];
      if (trimmed.includes(',')) {
        return trimmed.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      return [trimmed];
    }
    return fallback;
  }
};

const parseContentField = (val: any): any => {
  if (!val) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return trimmed;
      }
    }
  }
  return val;
};

const formatContentField = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

// Get all packages
export const getPackages: RequestHandler = async (req, res) => {
  try {
    const items = await dbAll("SELECT * FROM packages ORDER BY createdAt DESC");
    
    // Parse features & images JSON for each package
    const parsedItems = items.map((item: any) => ({
      ...item,
      features: parseSafeJson(item.features),
      images: parseSafeJson(item.images),
      is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
      vendor_breakdown: parseContentField(item.vendor_breakdown),
      bonuses: parseContentField(item.bonuses),
      payment_steps: parseContentField(item.payment_steps)
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

    const parsedItem = {
      ...item,
      features: parseSafeJson(item.features),
      images: parseSafeJson(item.images),
      is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
      vendor_breakdown: parseContentField(item.vendor_breakdown),
      bonuses: parseContentField(item.bonuses),
      payment_steps: parseContentField(item.payment_steps)
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

const formatJsonField = (val: any): string => {
  if (!val) return '[]';
  if (Array.isArray(val)) return JSON.stringify(val);
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return '[]';
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return JSON.stringify(parsed);
      return JSON.stringify([parsed]);
    } catch {
      if (trimmed.startsWith('data:')) return JSON.stringify([trimmed]);
      return JSON.stringify(trimmed.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean));
    }
  }
  return JSON.stringify(val);
};

// Create package
export const createPackage: RequestHandler = async (req, res) => {
  try {
    const { name, price, discount_price, description, highlighted, longDescription, features, images, is_active, vendor_breakdown, bonuses, payment_steps }: CreatePackageItem = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, error: 'Name and price are required' });
    }

    const featuresJson = formatJsonField(features);
    const imagesJson = formatJsonField(images);
    const vendorBreakdownVal = formatContentField(vendor_breakdown);
    const bonusesVal = formatContentField(bonuses);
    const paymentStepsVal = formatContentField(payment_steps);

    const result = await dbRun(
      "INSERT INTO packages (name, price, discount_price, description, highlighted, longDescription, features, images, is_active, vendor_breakdown, bonuses, payment_steps) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [name, parseFloat(String(price)) || 0, discount_price ? parseFloat(String(discount_price)) : null, description || '', highlighted ? 1 : 0, longDescription || '', featuresJson, imagesJson, is_active !== undefined ? (is_active ? 1 : 0) : 1, vendorBreakdownVal, bonusesVal, paymentStepsVal]
    );

    const newItem = await dbGet("SELECT * FROM packages WHERE id = ?", [result.lastID]);

    const parsedNewItem = {
      ...newItem,
      features: parseSafeJson(newItem.features),
      images: parseSafeJson(newItem.images),
      is_active: newItem.is_active !== undefined ? Boolean(newItem.is_active) : true,
      vendor_breakdown: parseContentField(newItem.vendor_breakdown),
      bonuses: parseContentField(newItem.bonuses),
      payment_steps: parseContentField(newItem.payment_steps)
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
      values.push(parseFloat(String(updates.price)) || 0);
    }
    if (updates.discount_price !== undefined) {
      updateFields.push("discount_price = ?");
      values.push(updates.discount_price ? parseFloat(String(updates.discount_price)) : null);
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
      values.push(formatJsonField(updates.features));
    }
    if (updates.images !== undefined) {
      updateFields.push("images = ?");
      values.push(formatJsonField(updates.images));
    }
    if (updates.is_active !== undefined) {
      updateFields.push("is_active = ?");
      values.push(updates.is_active ? 1 : 0);
    }
    if (updates.vendor_breakdown !== undefined) {
      updateFields.push("vendor_breakdown = ?");
      values.push(formatContentField(updates.vendor_breakdown));
    }
    if (updates.bonuses !== undefined) {
      updateFields.push("bonuses = ?");
      values.push(formatContentField(updates.bonuses));
    }
    if (updates.payment_steps !== undefined) {
      updateFields.push("payment_steps = ?");
      values.push(formatContentField(updates.payment_steps));
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

    const parsedUpdatedItem = {
      ...updatedItem,
      features: parseSafeJson(updatedItem.features),
      images: parseSafeJson(updatedItem.images),
      is_active: updatedItem.is_active !== undefined ? Boolean(updatedItem.is_active) : true,
      vendor_breakdown: parseContentField(updatedItem.vendor_breakdown),
      bonuses: parseContentField(updatedItem.bonuses),
      payment_steps: parseContentField(updatedItem.payment_steps)
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
