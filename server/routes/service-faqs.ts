import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";
import { ApiResponse, ListResponse } from "../../shared/api";

interface ServiceFAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  service_type: string;
  createdAt: string;
  updatedAt: string;
}

// Get all service FAQs
export const getServiceFAQs: RequestHandler = async (req, res) => {
  try {
    const { type } = req.query;
    let query = "SELECT * FROM service_faqs ORDER BY createdAt DESC";
    let params: any[] = [];

    if (type) {
      query = "SELECT * FROM service_faqs WHERE service_type = ? ORDER BY createdAt DESC";
      params = [type];
    }

    const items = await dbAll(query, params);
    const response: ListResponse<ServiceFAQ> = {
      success: true,
      data: items,
      total: items.length
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching service FAQs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch service FAQs' });
  }
};

// Get single service FAQ
export const getServiceFAQ: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await dbGet("SELECT * FROM service_faqs WHERE id = ?", [id]);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Service FAQ not found' });
    }

    const response: ApiResponse<ServiceFAQ> = {
      success: true,
      data: item
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching service FAQ:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch service FAQ' });
  }
};

// Create service FAQ
export const createServiceFAQ: RequestHandler = async (req, res) => {
  try {
    const { question, answer, category, service_type }: Partial<ServiceFAQ> = req.body;

    if (!question || !answer) {
      return res.status(400).json({ success: false, error: 'Question and answer are required' });
    }

    const result = await dbRun(
      "INSERT INTO service_faqs (question, answer, category, service_type) VALUES (?, ?, ?, ?)",
      [question, answer, category || '', service_type || 'general']
    );

    const newItem = await dbGet("SELECT * FROM service_faqs WHERE id = ?", [result.lastID]);

    const response: ApiResponse<ServiceFAQ> = {
      success: true,
      data: newItem,
      message: 'Service FAQ created successfully'
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating service FAQ:', error);
    res.status(500).json({ success: false, error: 'Failed to create service FAQ' });
  }
};

// Update service FAQ
export const updateServiceFAQ: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: Partial<ServiceFAQ> = req.body;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM service_faqs WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Service FAQ not found' });
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];

    if (updates.question !== undefined) {
      updateFields.push("question = ?");
      values.push(updates.question);
    }
    if (updates.answer !== undefined) {
      updateFields.push("answer = ?");
      values.push(updates.answer);
    }
    if (updates.category !== undefined) {
      updateFields.push("category = ?");
      values.push(updates.category);
    }
    if (updates.service_type !== undefined) {
      updateFields.push("service_type = ?");
      values.push(updates.service_type);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updateFields.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    await dbRun(
      `UPDATE service_faqs SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    const updatedItem = await dbGet("SELECT * FROM service_faqs WHERE id = ?", [id]);

    const response: ApiResponse<ServiceFAQ> = {
      success: true,
      data: updatedItem,
      message: 'Service FAQ updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating service FAQ:', error);
    res.status(500).json({ success: false, error: 'Failed to update service FAQ' });
  }
};

// Delete service FAQ
export const deleteServiceFAQ: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM service_faqs WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Service FAQ not found' });
    }

    await dbRun("DELETE FROM service_faqs WHERE id = ?", [id]);

    res.json({ success: true, message: 'Service FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting service FAQ:', error);
    res.status(500).json({ success: false, error: 'Failed to delete service FAQ' });
  }
};
