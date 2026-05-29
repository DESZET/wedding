import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";
import { ApiResponse, ListResponse } from "../../shared/api";

interface HajiPackage {
  id: number;
  name: string;
  description: string;
  quota_year: string;
  price: number;
  discount_price?: number;
  payment_terms: string[];
  included_features: string[];
  excluded_features: string[];
  requirements: string[];
  timeline: { month: string; activities: string[] }[];
  images: string[];
  featured: boolean;
  registration_deadline: string;
  available_quota: number;
  training_sessions: number;
  medical_facility: boolean;
  rating: number;
  reviews_count: number;
  accommodation_details: {
    mekah: { hotel: string; nights: number; distance: string };
    madinah: { hotel: string; nights: number; distance: string };
    jeddah?: { hotel: string; nights: number };
  };
  createdAt: string;
  updatedAt: string;
}

// Get all haji packages
export const getHajiPackages: RequestHandler = async (req, res) => {
  try {
    const items = await dbAll("SELECT * FROM haji_packages ORDER BY createdAt DESC");

    // Parse JSON fields
    const parsedItems = items.map((item: any) => ({
      ...item,
      payment_terms: item.payment_terms ? JSON.parse(item.payment_terms) : [],
      included_features: item.included_features ? JSON.parse(item.included_features) : [],
      excluded_features: item.excluded_features ? JSON.parse(item.excluded_features) : [],
      requirements: item.requirements ? JSON.parse(item.requirements) : [],
      timeline: item.timeline ? JSON.parse(item.timeline) : [],
      images: item.images ? JSON.parse(item.images) : [],
      accommodation_details: item.accommodation_details ? JSON.parse(item.accommodation_details) : {},
      featured: Boolean(item.featured),
      medical_facility: Boolean(item.medical_facility)
    }));

    const response: ListResponse<HajiPackage> = {
      success: true,
      data: parsedItems,
      total: parsedItems.length
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching haji packages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch haji packages' });
  }
};

// Get single haji package
export const getHajiPackage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await dbGet("SELECT * FROM haji_packages WHERE id = ?", [id]);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Haji package not found' });
    }

    // Parse JSON fields (same as getHajiPackages)
    const parsedItem = {
      ...item,
      payment_terms: item.payment_terms ? JSON.parse(item.payment_terms) : [],
      included_features: item.included_features ? JSON.parse(item.included_features) : [],
      excluded_features: item.excluded_features ? JSON.parse(item.excluded_features) : [],
      requirements: item.requirements ? JSON.parse(item.requirements) : [],
      timeline: item.timeline ? JSON.parse(item.timeline) : [],
      images: item.images ? JSON.parse(item.images) : [],
      accommodation_details: item.accommodation_details ? JSON.parse(item.accommodation_details) : {},
      featured: Boolean(item.featured),
      medical_facility: Boolean(item.medical_facility)
    };

    const response: ApiResponse<HajiPackage> = {
      success: true,
      data: parsedItem
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching haji package:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch haji package' });
  }
};

// Create haji package
export const createHajiPackage: RequestHandler = async (req, res) => {
  try {
    const packageData: Partial<HajiPackage> = req.body;

    if (!packageData.name || !packageData.price) {
      return res.status(400).json({ success: false, error: 'Name and price are required' });
    }

    const result = await dbRun(
      `INSERT INTO haji_packages (
        name, description, quota_year, price, discount_price, payment_terms, included_features,
        excluded_features, requirements, timeline, images, featured, registration_deadline,
        available_quota, training_sessions, medical_facility, rating, reviews_count, accommodation_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        packageData.name,
        packageData.description || '',
        packageData.quota_year || '',
        packageData.price,
        packageData.discount_price || null,
        JSON.stringify(packageData.payment_terms || []),
        JSON.stringify(packageData.included_features || []),
        JSON.stringify(packageData.excluded_features || []),
        JSON.stringify(packageData.requirements || []),
        JSON.stringify(packageData.timeline || []),
        JSON.stringify(packageData.images || []),
        packageData.featured ? 1 : 0,
        packageData.registration_deadline || '',
        packageData.available_quota || 0,
        packageData.training_sessions || 0,
        packageData.medical_facility ? 1 : 0,
        packageData.rating || 0,
        packageData.reviews_count || 0,
        JSON.stringify(packageData.accommodation_details || {})
      ]
    );

    const newItem = await dbGet("SELECT * FROM haji_packages WHERE id = ?", [result.lastID]);

    // Parse JSON fields for response
    const parsedNewItem = {
      ...newItem,
      payment_terms: newItem.payment_terms ? JSON.parse(newItem.payment_terms) : [],
      included_features: newItem.included_features ? JSON.parse(newItem.included_features) : [],
      excluded_features: newItem.excluded_features ? JSON.parse(newItem.excluded_features) : [],
      requirements: newItem.requirements ? JSON.parse(newItem.requirements) : [],
      timeline: newItem.timeline ? JSON.parse(newItem.timeline) : [],
      images: newItem.images ? JSON.parse(newItem.images) : [],
      accommodation_details: newItem.accommodation_details ? JSON.parse(newItem.accommodation_details) : {},
      featured: Boolean(newItem.featured),
      medical_facility: Boolean(newItem.medical_facility)
    };

    const response: ApiResponse<HajiPackage> = {
      success: true,
      data: parsedNewItem,
      message: 'Haji package created successfully'
    };
    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error creating haji package:', error);
    const errorMessage = error?.message || 'Failed to create haji package';
    res.status(500).json({ 
      success: false, 
      error: `Failed to create haji package: ${errorMessage}`,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update haji package
export const updateHajiPackage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: Partial<HajiPackage> = req.body;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM haji_packages WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Haji package not found' });
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
    if (updates.quota_year !== undefined) {
      updateFields.push("quota_year = ?");
      values.push(updates.quota_year);
    }
    if (updates.price !== undefined) {
      updateFields.push("price = ?");
      values.push(updates.price);
    }
    if (updates.discount_price !== undefined) {
      updateFields.push("discount_price = ?");
      values.push(updates.discount_price);
    }
    if (updates.payment_terms !== undefined) {
      updateFields.push("payment_terms = ?");
      values.push(JSON.stringify(updates.payment_terms));
    }
    if (updates.included_features !== undefined) {
      updateFields.push("included_features = ?");
      values.push(JSON.stringify(updates.included_features));
    }
    if (updates.excluded_features !== undefined) {
      updateFields.push("excluded_features = ?");
      values.push(JSON.stringify(updates.excluded_features));
    }
    if (updates.requirements !== undefined) {
      updateFields.push("requirements = ?");
      values.push(JSON.stringify(updates.requirements));
    }
    if (updates.timeline !== undefined) {
      updateFields.push("timeline = ?");
      values.push(JSON.stringify(updates.timeline));
    }
    if (updates.images !== undefined) {
      updateFields.push("images = ?");
      values.push(JSON.stringify(updates.images));
    }
    if (updates.featured !== undefined) {
      updateFields.push("featured = ?");
      values.push(updates.featured ? 1 : 0);
    }
    if (updates.registration_deadline !== undefined) {
      updateFields.push("registration_deadline = ?");
      values.push(updates.registration_deadline);
    }
    if (updates.available_quota !== undefined) {
      updateFields.push("available_quota = ?");
      values.push(updates.available_quota);
    }
    if (updates.training_sessions !== undefined) {
      updateFields.push("training_sessions = ?");
      values.push(updates.training_sessions);
    }
    if (updates.medical_facility !== undefined) {
      updateFields.push("medical_facility = ?");
      values.push(updates.medical_facility ? 1 : 0);
    }
    if (updates.rating !== undefined) {
      updateFields.push("rating = ?");
      values.push(updates.rating);
    }
    if (updates.reviews_count !== undefined) {
      updateFields.push("reviews_count = ?");
      values.push(updates.reviews_count);
    }
    if (updates.accommodation_details !== undefined) {
      updateFields.push("accommodation_details = ?");
      values.push(JSON.stringify(updates.accommodation_details));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updateFields.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    await dbRun(
      `UPDATE haji_packages SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    const updatedItem = await dbGet("SELECT * FROM haji_packages WHERE id = ?", [id]);

    const response: ApiResponse<HajiPackage> = {
      success: true,
      data: updatedItem,
      message: 'Haji package updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating haji package:', error);
    res.status(500).json({ success: false, error: 'Failed to update haji package' });
  }
};

// Delete haji package
export const deleteHajiPackage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM haji_packages WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Haji package not found' });
    }

    await dbRun("DELETE FROM haji_packages WHERE id = ?", [id]);

    res.json({ success: true, message: 'Haji package deleted successfully' });
  } catch (error) {
    console.error('Error deleting haji package:', error);
    res.status(500).json({ success: false, error: 'Failed to delete haji package' });
  }
};
