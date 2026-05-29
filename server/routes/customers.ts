import express from 'express';
import { dbAll, dbGet, dbRun } from '../database';

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await dbAll(`
      SELECT c.*,
             COALESCE(SUM(CASE WHEN cd.is_paid = 0 THEN cd.amount ELSE 0 END), 0) as total_unpaid_debt
      FROM customers c
      LEFT JOIN customer_debts cd ON c.id = cd.customer_id
      GROUP BY c.id
      ORDER BY c.createdAt DESC
    `);

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers'
    });
  }
});

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await dbGet(`
      SELECT c.*,
             COALESCE(SUM(CASE WHEN cd.is_paid = 0 THEN cd.amount ELSE 0 END), 0) as total_unpaid_debt
      FROM customers c
      LEFT JOIN customer_debts cd ON c.id = cd.customer_id
      WHERE c.id = ?
      GROUP BY c.id
    `, [req.params.id]);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer'
    });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, address, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Customer name is required'
      });
    }

    const result = await dbRun(`
      INSERT INTO customers (name, phone, email, address, notes)
      VALUES (?, ?, ?, ?, ?)
    `, [name, phone, email, address, notes]);

    const customer = await dbGet('SELECT * FROM customers WHERE id = ?', [result.lastID]);

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create customer'
    });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, email, address, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Customer name is required'
      });
    }

    await dbRun(`
      UPDATE customers
      SET name = ?, phone = ?, email = ?, address = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, phone, email, address, notes, req.params.id]);

    const customer = await dbGet(`
      SELECT c.*,
             COALESCE(SUM(CASE WHEN cd.is_paid = 0 THEN cd.amount ELSE 0 END), 0) as total_unpaid_debt
      FROM customers c
      LEFT JOIN customer_debts cd ON c.id = cd.customer_id
      WHERE c.id = ?
      GROUP BY c.id
    `, [req.params.id]);

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update customer'
    });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    // First delete all debts for this customer
    await dbRun('DELETE FROM customer_debts WHERE customer_id = ?', [req.params.id]);

    // Then delete the customer
    await dbRun('DELETE FROM customers WHERE id = ?', [req.params.id]);

    res.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete customer'
    });
  }
});

export default router;
