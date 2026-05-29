import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";

// Get all printing orders
export const getPrintingOrders: RequestHandler = async (req, res) => {
  try {
    const orders = await dbAll("SELECT * FROM printing_orders ORDER BY createdAt DESC");
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching printing orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch printing orders' });
  }
};

// Get single printing order
export const getPrintingOrder: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await dbGet("SELECT * FROM printing_orders WHERE id = ?", [id]);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Printing order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching printing order:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch printing order' });
  }
};

// Create printing order
export const createPrintingOrder: RequestHandler = async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, product_id, quantity, total_price, status, notes } = req.body;

    const result = await dbRun(
      "INSERT INTO printing_orders (customer_name, customer_email, customer_phone, product_id, quantity, total_price, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [customer_name, customer_email, customer_phone, product_id, quantity, total_price, status || 'pending', notes || '']
    );

    const newOrder = await dbGet("SELECT * FROM printing_orders WHERE id = ?", [result.lastID]);
    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error('Error creating printing order:', error);
    res.status(500).json({ success: false, error: 'Failed to create printing order' });
  }
};

// Update printing order
export const updatePrintingOrder: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    await dbRun(
      "UPDATE printing_orders SET status = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [status, notes || '', id]
    );

    const updatedOrder = await dbGet("SELECT * FROM printing_orders WHERE id = ?", [id]);
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Error updating printing order:', error);
    res.status(500).json({ success: false, error: 'Failed to update printing order' });
  }
};

// Delete printing order
export const deletePrintingOrder: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun("DELETE FROM printing_orders WHERE id = ?", [id]);
    res.json({ success: true, message: 'Printing order deleted successfully' });
  } catch (error) {
    console.error('Error deleting printing order:', error);
    res.status(500).json({ success: false, error: 'Failed to delete printing order' });
  }
};

