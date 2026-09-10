import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";
import { ApiResponse, ListResponse } from "../../shared/api";

interface PrintingProduct {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  size_options: string;
  material_options: string;
  color_options: string;
  finishing_options?: string;
  design_template_url: string;
  images: string;
  features?: string;
  rating?: number;
  reviews_count?: number;
  featured?: boolean;
  is_custom_design: boolean;
  estimated_time: string;
  min_order: number;
  is_active: boolean;
  custom_materials?: any;
  custom_finishings?: any;
  custom_process_steps?: any;
  createdAt: string;
  updatedAt: string;
}

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

const parseSafeArray = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
      } catch {}
    }
    if (trimmed.startsWith('data:')) return [trimmed];
    return trimmed.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean);
  }
  return [];
};

const formatJsonArray = (val: any): string => {
  if (!val) return '[]';
  if (Array.isArray(val)) return JSON.stringify(val.filter(Boolean));
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return '[]';
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return JSON.stringify(parsed.filter(Boolean));
      return JSON.stringify([parsed]);
    } catch {
      if (trimmed.startsWith('data:')) return JSON.stringify([trimmed]);
      return JSON.stringify(trimmed.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean));
    }
  }
  return JSON.stringify([val]);
};

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
    const transformedItems = items.map(item => {
      const parsedFeatures = parseSafeArray(item.features);
      return {
        id: item.id,
        category_id: item.category_id,
        category_name: item.category_name,
        name: item.name,
        description: item.description || '',
        price: Number(item.price) || 0,
        discount_price: item.discount_price ? Number(item.discount_price) : null,
        size_options: parseSafeArray(item.size_options),
        material_options: parseSafeArray(item.material_options),
        color_options: parseSafeArray(item.color_options),
        finishing_options: parseSafeArray(item.finishing_options),
        images: parseSafeArray(item.images),
        design_template_url: item.design_template_url || '',
        is_custom_design: Boolean(item.is_custom_design),
        estimated_time: item.estimated_time || '3-5 hari',
        min_order: Number(item.min_order) || 1,
        is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
        features: parsedFeatures.length > 0 ? parsedFeatures : ["Kualitas Terjamin", "Harga Kompetitif", "Pengiriman Cepat"],
        rating: item.rating ? Number(item.rating) : 4.9,
        reviews_count: item.reviews_count ? Number(item.reviews_count) : 0,
        is_featured: Boolean(item.featured),
        is_new: item.createdAt ? (new Date(item.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) : false,
        custom_materials: parseContentField(item.custom_materials),
        custom_finishings: parseContentField(item.custom_finishings),
        custom_process_steps: parseContentField(item.custom_process_steps),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    });

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
    const item = await dbGet(`
      SELECT
        pp.*,
        pc.name as category_name,
        pc.icon as category_icon
      FROM printing_products pp
      LEFT JOIN printing_categories pc ON pp.category_id = pc.id
      WHERE pp.id = ?
    `, [id]);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Printing product not found' });
    }

    const parsedFeatures = parseSafeArray(item.features);
    const transformedItem = {
      ...item,
      price: Number(item.price) || 0,
      discount_price: item.discount_price ? Number(item.discount_price) : null,
      images: parseSafeArray(item.images),
      size_options: parseSafeArray(item.size_options),
      material_options: parseSafeArray(item.material_options),
      color_options: parseSafeArray(item.color_options),
      finishing_options: parseSafeArray(item.finishing_options),
      features: parsedFeatures.length > 0 ? parsedFeatures : ["Kualitas Terjamin", "Harga Kompetitif", "Pengiriman Cepat"],
      rating: item.rating ? Number(item.rating) : 4.9,
      reviews_count: item.reviews_count ? Number(item.reviews_count) : 0,
      is_featured: Boolean(item.featured),
      is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
      custom_materials: parseContentField(item.custom_materials),
      custom_finishings: parseContentField(item.custom_finishings),
      custom_process_steps: parseContentField(item.custom_process_steps),
    };

    const response: ApiResponse<any> = {
      success: true,
      data: transformedItem
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
    const productData: any = req.body;

    // Validate required fields
    if (!productData.name || !String(productData.name).trim()) {
      return res.status(400).json({ success: false, error: 'Nama produk harus diisi' });
    }
    if (!productData.price || Number(productData.price) <= 0) {
      return res.status(400).json({ success: false, error: 'Harga produk harus lebih dari 0' });
    }
    if (!productData.category_id && productData.category_id !== 0) {
      return res.status(400).json({ success: false, error: 'Kategori produk harus dipilih' });
    }

    // Check if category exists
    const categoryExists = await dbGet("SELECT id FROM printing_categories WHERE id = ?", [productData.category_id]);
    if (!categoryExists) {
      return res.status(400).json({ success: false, error: 'Kategori produk tidak valid' });
    }

    // Check for duplicate name
    const existingProduct = await dbGet("SELECT id FROM printing_products WHERE name = ?", [String(productData.name).trim()]);
    if (existingProduct) {
      return res.status(400).json({ success: false, error: 'Nama produk sudah ada' });
    }

    const imagesJson = formatJsonArray(productData.images);
    const sizeOptionsStr = Array.isArray(productData.size_options) ? productData.size_options.join(', ') : (productData.size_options || '');
    const materialOptionsStr = Array.isArray(productData.material_options) ? productData.material_options.join(', ') : (productData.material_options || '');
    const colorOptionsStr = Array.isArray(productData.color_options) ? productData.color_options.join(', ') : (productData.color_options || '');
    const finishingOptionsStr = Array.isArray(productData.finishing_options) ? productData.finishing_options.join(', ') : (productData.finishing_options || '');
    const featuresJson = formatJsonArray(productData.features);

    const result = await dbRun(
      `INSERT INTO printing_products (
        category_id, name, description, price, discount_price, size_options, material_options,
        color_options, finishing_options, features, design_template_url, images, is_custom_design,
        estimated_time, min_order, is_active, featured, rating, reviews_count,
        custom_materials, custom_finishings, custom_process_steps
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productData.category_id,
        String(productData.name).trim(),
        productData.description || '',
        Number(productData.price),
        productData.discount_price ? Number(productData.discount_price) : null,
        sizeOptionsStr,
        materialOptionsStr,
        colorOptionsStr,
        finishingOptionsStr,
        featuresJson,
        productData.design_template_url || '',
        imagesJson,
        productData.is_custom_design ? 1 : 0,
        productData.estimated_time || '3-5 hari',
        Number(productData.min_order) || 1,
        productData.is_active !== false ? 1 : 0,
        productData.featured || productData.is_featured ? 1 : 0,
        Number(productData.rating) || 5.0,
        Number(productData.reviews_count) || 0,
        formatContentField(productData.custom_materials),
        formatContentField(productData.custom_finishings),
        formatContentField(productData.custom_process_steps)
      ]
    );

    const newItem = await dbGet("SELECT * FROM printing_products WHERE id = ?", [result.lastID]);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        ...newItem,
        images: parseSafeArray(newItem.images),
        size_options: parseSafeArray(newItem.size_options),
        material_options: parseSafeArray(newItem.material_options),
        color_options: parseSafeArray(newItem.color_options),
        finishing_options: parseSafeArray(newItem.finishing_options),
        features: parseSafeArray(newItem.features),
        custom_materials: parseContentField(newItem.custom_materials),
        custom_finishings: parseContentField(newItem.custom_finishings),
        custom_process_steps: parseContentField(newItem.custom_process_steps),
      },
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
    const updates: any = req.body;

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
      values.push(String(updates.name).trim());
    }
    if (updates.description !== undefined) {
      updateFields.push("description = ?");
      values.push(updates.description || '');
    }
    if (updates.price !== undefined) {
      updateFields.push("price = ?");
      values.push(Number(updates.price) || 0);
    }
    if (updates.discount_price !== undefined) {
      updateFields.push("discount_price = ?");
      values.push(updates.discount_price ? Number(updates.discount_price) : null);
    }
    if (updates.size_options !== undefined) {
      updateFields.push("size_options = ?");
      values.push(Array.isArray(updates.size_options) ? updates.size_options.join(', ') : (updates.size_options || ''));
    }
    if (updates.material_options !== undefined) {
      updateFields.push("material_options = ?");
      values.push(Array.isArray(updates.material_options) ? updates.material_options.join(', ') : (updates.material_options || ''));
    }
    if (updates.color_options !== undefined) {
      updateFields.push("color_options = ?");
      values.push(Array.isArray(updates.color_options) ? updates.color_options.join(', ') : (updates.color_options || ''));
    }
    if (updates.finishing_options !== undefined) {
      updateFields.push("finishing_options = ?");
      values.push(Array.isArray(updates.finishing_options) ? updates.finishing_options.join(', ') : (updates.finishing_options || ''));
    }
    if (updates.features !== undefined) {
      updateFields.push("features = ?");
      values.push(formatJsonArray(updates.features));
    }
    if (updates.design_template_url !== undefined) {
      updateFields.push("design_template_url = ?");
      values.push(updates.design_template_url || '');
    }
    if (updates.images !== undefined) {
      updateFields.push("images = ?");
      values.push(formatJsonArray(updates.images));
    }
    if (updates.is_custom_design !== undefined) {
      updateFields.push("is_custom_design = ?");
      values.push(updates.is_custom_design ? 1 : 0);
    }
    if (updates.estimated_time !== undefined) {
      updateFields.push("estimated_time = ?");
      values.push(updates.estimated_time || '3-5 hari');
    }
    if (updates.min_order !== undefined) {
      updateFields.push("min_order = ?");
      values.push(Number(updates.min_order) || 1);
    }
    if (updates.is_active !== undefined) {
      updateFields.push("is_active = ?");
      values.push(updates.is_active ? 1 : 0);
    }
    if (updates.featured !== undefined || updates.is_featured !== undefined) {
      updateFields.push("featured = ?");
      values.push((updates.featured || updates.is_featured) ? 1 : 0);
    }
    if (updates.rating !== undefined) {
      updateFields.push("rating = ?");
      values.push(Number(updates.rating) || 5.0);
    }
    if (updates.reviews_count !== undefined) {
      updateFields.push("reviews_count = ?");
      values.push(Number(updates.reviews_count) || 0);
    }
    if (updates.custom_materials !== undefined) {
      updateFields.push("custom_materials = ?");
      values.push(formatContentField(updates.custom_materials));
    }
    if (updates.custom_finishings !== undefined) {
      updateFields.push("custom_finishings = ?");
      values.push(formatContentField(updates.custom_finishings));
    }
    if (updates.custom_process_steps !== undefined) {
      updateFields.push("custom_process_steps = ?");
      values.push(formatContentField(updates.custom_process_steps));
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

    const updatedItem = await dbGet(`
      SELECT
        pp.*,
        pc.name as category_name,
        pc.icon as category_icon
      FROM printing_products pp
      LEFT JOIN printing_categories pc ON pp.category_id = pc.id
      WHERE pp.id = ?
    `, [id]);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        ...updatedItem,
        price: Number(updatedItem.price) || 0,
        discount_price: updatedItem.discount_price ? Number(updatedItem.discount_price) : null,
        images: parseSafeArray(updatedItem.images),
        size_options: parseSafeArray(updatedItem.size_options),
        material_options: parseSafeArray(updatedItem.material_options),
        color_options: parseSafeArray(updatedItem.color_options),
        finishing_options: parseSafeArray(updatedItem.finishing_options),
        features: parseSafeArray(updatedItem.features),
        is_featured: Boolean(updatedItem.featured),
        is_active: updatedItem.is_active !== undefined ? Boolean(updatedItem.is_active) : true,
        custom_materials: parseContentField(updatedItem.custom_materials),
        custom_finishings: parseContentField(updatedItem.custom_finishings),
        custom_process_steps: parseContentField(updatedItem.custom_process_steps),
      },
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
