import express from 'express';
import { dbAll, dbGet, dbRun } from '../database';

const router = express.Router();

// Get all debts for a customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const debts = await dbAll(`
      SELECT * FROM customer_debts
      WHERE customer_id = ?
      ORDER BY date DESC, createdAt DESC
    `, [req.params.customerId]);

    res.json({
      success: true,
      data: debts
    });
  } catch (error) {
    console.error('Error fetching customer debts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer debts'
    });
  }
});

// Get all debts
router.get('/', async (req, res) => {
  try {
    const debts = await dbAll(`
      SELECT cd.*, c.name as customer_name, c.phone as customer_phone
      FROM customer_debts cd
      JOIN customers c ON cd.customer_id = c.id
      ORDER BY cd.date DESC, cd.createdAt DESC
    `);

    res.json({
      success: true,
      data: debts
    });
  } catch (error) {
    console.error('Error fetching debts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch debts'
    });
  }
});

// Create debt
router.post('/', async (req, res) => {
  try {
    const { customer_id, amount, description, date } = req.body;

    if (!customer_id || !amount || !date) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID, amount, and date are required'
      });
    }

    const result = await dbRun(`
      INSERT INTO customer_debts (customer_id, amount, description, date)
      VALUES (?, ?, ?, ?)
    `, [customer_id, amount, description, date]);

    // Update customer's total debt
    await updateCustomerTotalDebt(customer_id);

    const debt = await dbGet(`
      SELECT cd.*, c.name as customer_name, c.phone as customer_phone
      FROM customer_debts cd
      JOIN customers c ON cd.customer_id = c.id
      WHERE cd.id = ?
    `, [result.lastID]);

    res.json({
      success: true,
      data: debt
    });
  } catch (error) {
    console.error('Error creating debt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create debt'
    });
  }
});

// Update debt
router.put('/:id', async (req, res) => {
  try {
    const { amount, description, date, is_paid } = req.body;

    const existingDebt = await dbGet('SELECT * FROM customer_debts WHERE id = ?', [req.params.id]);
    if (!existingDebt) {
      return res.status(404).json({
        success: false,
        error: 'Debt not found'
      });
    }

    await dbRun(`
      UPDATE customer_debts
      SET amount = ?, description = ?, date = ?, is_paid = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [amount, description, date, is_paid ? 1 : 0, req.params.id]);

    // Update customer's total debt
    await updateCustomerTotalDebt(existingDebt.customer_id);

    const debt = await dbGet(`
      SELECT cd.*, c.name as customer_name, c.phone as customer_phone
      FROM customer_debts cd
      JOIN customers c ON cd.customer_id = c.id
      WHERE cd.id = ?
    `, [req.params.id]);

    res.json({
      success: true,
      data: debt
    });
  } catch (error) {
    console.error('Error updating debt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update debt'
    });
  }
});

// Delete debt
router.delete('/:id', async (req, res) => {
  try {
    const existingDebt = await dbGet('SELECT * FROM customer_debts WHERE id = ?', [req.params.id]);
    if (!existingDebt) {
      return res.status(404).json({
        success: false,
        error: 'Debt not found'
      });
    }

    await dbRun('DELETE FROM customer_debts WHERE id = ?', [req.params.id]);

    // Update customer's total debt
    await updateCustomerTotalDebt(existingDebt.customer_id);

    res.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting debt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete debt'
    });
  }
});

// Helper function to update customer's total debt
async function updateCustomerTotalDebt(customerId: number) {
  try {
    const result = await dbGet(`
      SELECT COALESCE(SUM(amount), 0) as total_debt
      FROM customer_debts
      WHERE customer_id = ? AND is_paid = 0
    `, [customerId]);

    await dbRun(`
      UPDATE customers
      SET total_debt = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [result.total_debt, customerId]);
  } catch (error) {
    console.error('Error updating customer total debt:', error);
  }
}

export default router;
