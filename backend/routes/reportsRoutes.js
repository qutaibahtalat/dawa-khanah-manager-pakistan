const express = require('express');
const router = express.Router();
const db = require('../database');

// Get customer purchase history
router.get('/customer-purchases', async (req, res) => {
  try {
    const { customerId, startDate, endDate } = req.query;
    const whereClause = [];
    const params = [];

    if (customerId) {
      whereClause.push('s.customer_id = ?');
      params.push(customerId);
    }

    if (startDate) {
      whereClause.push('s.date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereClause.push('s.date <= ?');
      params.push(endDate);
    }

    const query = `
      SELECT s.id as saleId, 
             s.date,
             c.name as customerName,
             si.quantity,
             i.name as itemName,
             i.salePrice,
             si.unit_price as salePrice,
             (si.quantity * si.unit_price) as subtotal
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN sale_items si ON s.id = si.sale_id
      LEFT JOIN inventory i ON si.inventory_id = i.id
      ${whereClause.length ? 'WHERE ' + whereClause.join(' AND ') : ''}
      ORDER BY s.date DESC
    `;

    const purchases = await db.all(query, params);
    res.json(purchases);
  } catch (err) {
    console.error('Error fetching customer purchases:', err);
    res.status(500).json({ error: 'Failed to fetch customer purchases', details: err.message });
  }
});

// Get profit report
router.get('/profit', async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    let query = `SELECT 
      DATE(s.date) as date,
      SUM(si.quantity * si.unit_price) as totalSales,
      SUM(si.quantity * i.purchasePrice) as totalCost,
      SUM(si.quantity * si.unit_price) - SUM(si.quantity * i.purchasePrice) as profit
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN inventory i ON si.inventory_id = i.id`;

    const params = [];
    const whereClause = [];

    if (startDate) {
      whereClause.push('s.date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereClause.push('s.date <= ?');
      params.push(endDate);
    }

    if (whereClause.length > 0) {
      query += ' WHERE ' + whereClause.join(' AND ');
    }

    // Group by period
    if (period === 'daily') {
      query += ' GROUP BY DATE(s.date) ORDER BY DATE(s.date) DESC';
    } else if (period === 'weekly') {
      query += ' GROUP BY strftime("%Y-%W", s.date) ORDER BY strftime("%Y-%W", s.date) DESC';
    } else if (period === 'monthly') {
      query += ' GROUP BY strftime("%Y-%m", s.date) ORDER BY strftime("%Y-%m", s.date) DESC';
    } else {
      query += ' GROUP BY DATE(s.date) ORDER BY DATE(s.date) DESC';
    }

    const results = await db.all(query, params);
    
    // Calculate totals
    const totals = {
      totalSales: results.reduce((sum, r) => sum + r.totalSales, 0),
      totalCost: results.reduce((sum, r) => sum + r.totalCost, 0),
      totalProfit: results.reduce((sum, r) => sum + r.profit, 0)
    };

    res.json({
      data: results,
      totals
    });
  } catch (err) {
    console.error('Error generating profit report:', err);
    res.status(500).json({ error: 'Failed to generate profit report', details: err.message });
  }
});

// Get inventory report
router.get('/inventory', async (req, res) => {
  try {
    const query = `
      SELECT 
        i.*,
        COALESCE(SUM(si.quantity * si.unit_price), 0) as totalSold,
        COALESCE(SUM(si.quantity * i.purchasePrice), 0) as totalCost,
        COALESCE(SUM(si.quantity * si.unit_price) - SUM(si.quantity * i.purchasePrice), 0) as profit
      FROM inventory i
      LEFT JOIN sale_items si ON i.id = si.inventory_id
      GROUP BY i.id
      ORDER BY i.name
    `;

    const inventory = await db.all(query);
    res.json(inventory);
  } catch (err) {
    console.error('Error generating inventory report:', err);
    res.status(500).json({ error: 'Failed to generate inventory report', details: err.message });
  }
});

module.exports = router;
