const express = require('express');
const router = express.Router();
const db = require('../database');

// Create a sale transaction
router.post('/transactions', async (req, res) => {
  try {
    const { items, customerId, paymentMethod, totalAmount, discount } = req.body;

    // Validation
    if (!items || !items.length) {
      return res.status(400).json({ error: 'At least one item is required' });
    }

    if (totalAmount <= 0) {
      return res.status(400).json({ error: 'Total amount must be positive' });
    }

    // Start transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Create sale record
      const saleResult = await db.run(
        `INSERT INTO sales (customer_id, payment_method, total_amount, discount, status, date)
         VALUES (?, ?, ?, ?, 'completed', CURRENT_TIMESTAMP)`,
        [customerId, paymentMethod, totalAmount, discount || 0]
      );

      const saleId = saleResult.lastID;

      // Update inventory and create sale items
      for (const item of items) {
        // Check if item exists and has sufficient stock
        const inventoryItem = await db.get(
          'SELECT * FROM inventory WHERE id = ?',
          [item.itemId]
        );

        if (!inventoryItem) {
          throw new Error(`Item ${item.itemId} not found`);
        }

        if (inventoryItem.stock < item.quantity) {
          throw new Error(`Insufficient stock for item ${item.itemId}`);
        }

        // Update inventory
        await db.run(
          'UPDATE inventory SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.itemId]
        );

        // Create sale item record
        await db.run(
          `INSERT INTO sale_items (sale_id, inventory_id, quantity, unit_price)
           VALUES (?, ?, ?, ?)`,
          [saleId, item.itemId, item.quantity, item.unitPrice]
        );
      }

      // Commit transaction
      await db.run('COMMIT');

      // Generate receipt
      const receipt = await generateReceipt(saleId);

      res.status(201).json({
        saleId,
        receipt,
        message: 'Sale completed successfully'
      });

    } catch (err) {
      // Rollback transaction on error
      await db.run('ROLLBACK');
      throw err;
    }

  } catch (err) {
    console.error('Error creating sale:', err);
    res.status(500).json({ error: 'Failed to complete sale', details: err.message });
  }
});

// Get sale history
router.get('/history', async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;
    const whereClause = [];
    const params = [];

    if (startDate) {
      whereClause.push('date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereClause.push('date <= ?');
      params.push(endDate);
    }

    if (customerId) {
      whereClause.push('customer_id = ?');
      params.push(customerId);
    }

    const query = `
      SELECT s.*, 
             c.name as customer_name,
             SUM(si.quantity * si.unit_price) as total_amount
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN sale_items si ON s.id = si.sale_id
      ${whereClause.length ? 'WHERE ' + whereClause.join(' AND ') : ''}
      GROUP BY s.id
      ORDER BY s.date DESC
    `;

    const sales = await db.all(query, params);
    res.json(sales);
  } catch (err) {
    console.error('Error fetching sales history:', err);
    res.status(500).json({ error: 'Failed to fetch sales history', details: err.message });
  }
});

// Helper function to generate receipt
async function generateReceipt(saleId) {
  try {
    const sale = await db.get(
      'SELECT * FROM sales WHERE id = ?',
      [saleId]
    );

    const items = await db.all(
      `SELECT i.name as itemName, si.quantity, si.unit_price,
              (si.quantity * si.unit_price) as subtotal
       FROM sale_items si
       JOIN inventory i ON si.inventory_id = i.id
       WHERE si.sale_id = ?`,
      [saleId]
    );

    const receipt = {
      saleId: sale.id,
      date: sale.date,
      customer: sale.customer_id ? await db.get('SELECT name FROM customers WHERE id = ?', [sale.customer_id]) : null,
      paymentMethod: sale.payment_method,
      items: items,
      total: sale.total_amount,
      discount: sale.discount || 0,
      finalAmount: sale.total_amount - (sale.discount || 0)
    };

    return receipt;
  } catch (err) {
    console.error('Error generating receipt:', err);
    throw err;
  }
}

module.exports = router;
