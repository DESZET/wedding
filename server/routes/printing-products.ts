import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";
import { ApiResponse, ListResponse } from "../../shared/api";

interface PrintingProduct {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  discount_price: number;
  size_options: string;
  material_options: string;
  color_options: string;
  design_template_url: string;
  images: string;
  is_custom_design: boolean;
  estimated_time: string;
  min_order: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get all printing products
export const getPrintingProducts: RequestHandler = async (req, res) => {
  try {
    const { category_id, is_active } = req.query;
    let query = `
      SELECT
        pp.*,
        pc.name as category_name,
        pc.icon as category_icon
      FROM printing_products pp
      LEFT JOIN printing_categories pc ON pp.category_id = pc.id
    `;
    let params: any[] = [];
    let whereClauses: string[] = [];

    if (category_id) {
      whereClauses.push("pp.category_id = ?");
      params.push(category_id);
    }
    if (is_active !== undefined) {
      whereClauses.push("pp.is_active = ?");
      params.push(is_active === 'true' ? 1 : 0);
    }

    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    query += " ORDER BY pp.createdAt DESC";

    let items = await dbAll(query, params);

    // Transform data to match frontend expectations
    const transformedItems = items.map(item => ({
      id: item.id,
      category_id: item.category_id,
      category_name: item.category_name,
      name: item.name,
      description: item.description,
      price: item.price,
      discount_price: item.discount_price,
      size_options: item.size_options ? item.size_options.split(',').map((s: string) => s.trim()) : [],
      material_options: item.material_options ? item.material_options.split(',').map((m: string) => m.trim()) : [],
      color_options: item.color_options ? item.color_options.split(',').map((c: string) => c.trim()) : [],
      finishing_options: [], // Not stored in DB, keeping empty array
      images: item.images ? item.images.split(',').map(img => img.trim()) : [], // Convert comma-separated images to array
      design_template_url: item.design_template_url,
      is_custom_design: Boolean(item.is_custom_design),
      estimated_time: item.estimated_time,
      min_order: item.min_order,
      is_active: Boolean(item.is_active),
      // Frontend-specific fields
      features: ["Kualitas Terjamin", "Harga Kompetitif", "Pengiriman Cepat"], // Default features
      rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
      reviews_count: Math.floor(Math.random() * 50) + 10, // Random reviews 10-60
      is_featured: Boolean(item.featured), // Map from DB field if exists
      is_new: new Date(item.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // New if created within 30 days
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    const response: ListResponse<any> = {
      success: true,
      data: transformedItems,
      total: transformedItems.length
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching printing products:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch printing products' });
  }
};

// Get single printing product
export const getPrintingProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await dbGet("SELECT * FROM printing_products WHERE id = ?", [id]);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Printing product not found' });
    }

    const response: ApiResponse<PrintingProduct> = {
      success: true,
      data: item
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching printing product:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch printing product' });
  }
};

// Create printing product
export const createPrintingProduct: RequestHandler = async (req, res) => {
  try {
    const productData: Partial<PrintingProduct> = req.body;

    // Validate required fields
    if (!productData.name || !productData.name.trim()) {
      return res.status(400).json({ success: false, error: 'Nama produk harus diisi' });
    }
    if (!productData.price || productData.price <= 0) {
      return res.status(400).json({ success: false, error: 'Harga produk harus lebih dari 0' });
    }
    if (!productData.category_id || productData.category_id === null || productData.category_id === undefined) {
      return res.status(400).json({ success: false, error: 'Kategori produk harus dipilih' });
    }

    // Check if category exists
    const categoryExists = await dbGet("SELECT id FROM printing_categories WHERE id = ?", [productData.category_id]);
    if (!categoryExists) {
      return res.status(400).json({ success: false, error: 'Kategori produk tidak valid' });
    }

    // Check for duplicate name
    const existingProduct = await dbGet("SELECT id FROM printing_products WHERE name = ?", [productData.name.trim()]);
    if (existingProduct) {
      return res.status(400).json({ success: false, error: 'Nama produk sudah ada' });
    }

    const result = await dbRun(
      `INSERT INTO printing_products (
        category_id, name, description, price, discount_price, size_options, material_options,
        color_options, design_template_url, images, is_custom_design, estimated_time, min_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productData.category_id,
        productData.name.trim(),
        productData.description || '',
        productData.price,
        productData.discount_price || null,
        productData.size_options || '',
        productData.material_options || '',
        productData.color_options || '',
        productData.design_template_url || '',
        productData.images || '',
        productData.is_custom_design ? 1 : 0,
        productData.estimated_time || '',
        productData.min_order || 1,
        productData.is_active !== false ? 1 : 0
      ]
    );

    const newItem = await dbGet("SELECT * FROM printing_products WHERE id = ?", [result.lastID]);

    const response: ApiResponse<PrintingProduct> = {
      success: true,
      data: newItem,
      message: 'Produk percetakan berhasil dibuat'
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating printing product:', error);
    res.status(500).json({ success: false, error: 'Gagal membuat produk percetakan: ' + (error as Error).message });
  }
};

// Update printing product
export const updatePrintingProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: Partial<PrintingProduct> = req.body;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM printing_products WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Printing product not found' });
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];

    if (updates.category_id !== undefined) {
      updateFields.push("category_id = ?");
      values.push(updates.category_id);
    }
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
    if (updates.size_options !== undefined) {
      updateFields.push("size_options = ?");
      values.push(updates.size_options);
    }
    if (updates.material_options !== undefined) {
      updateFields.push("material_options = ?");
      values.push(updates.material_options);
    }
    if (updates.color_options !== undefined) {
      updateFields.push("color_options = ?");
      values.push(updates.color_options);
    }

    if (updates.design_template_url !== undefined) {
      updateFields.push("design_template_url = ?");
      values.push(updates.design_template_url);
    }
    if (updates.images !== undefined) {
      updateFields.push("images = ?");
      values.push(updates.images);
    }
    if (updates.is_custom_design !== undefined) {
      updateFields.push("is_custom_design = ?");
      values.push(updates.is_custom_design ? 1 : 0);
    }
    if (updates.estimated_time !== undefined) {
      updateFields.push("estimated_time = ?");
      values.push(updates.estimated_time);
    }
    if (updates.min_order !== undefined) {
      updateFields.push("min_order = ?");
      values.push(updates.min_order);
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
      `UPDATE printing_products SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    const updatedItem = await dbGet("SELECT * FROM printing_products WHERE id = ?", [id]);

    const response: ApiResponse<PrintingProduct> = {
      success: true,
      data: updatedItem,
      message: 'Printing product updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating printing product:', error);
    res.status(500).json({ success: false, error: 'Failed to update printing product' });
  }
};

// Delete printing product
export const deletePrintingProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM printing_products WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Printing product not found' });
    }

    await dbRun("DELETE FROM printing_products WHERE id = ?", [id]);

    res.json({ success: true, message: 'Printing product deleted successfully' });
  } catch (error) {
    console.error('Error deleting printing product:', error);
    res.status(500).json({ success: false, error: 'Failed to delete printing product' });
  }
};
