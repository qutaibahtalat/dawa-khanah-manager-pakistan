const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const inventory = await db.all('SELECT * FROM inventory');
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new inventory item
router.post('/', async (req, res) => {
  try {
    const { name, category, stock, minStock, maxStock, purchasePrice, salePrice, manufacturer, batchNo, expiryDate, manufacturingDate } = req.body;

    // Validation
    if (!name || !purchasePrice || !salePrice || !stock) {
      return res.status(400).json({ error: 'name, purchasePrice, salePrice, and stock are required' });
    }

    if (purchasePrice <= 0 || salePrice <= 0 || stock < 0) {
      return res.status(400).json({ error: 'purchasePrice, salePrice must be positive and stock cannot be negative' });
    }

    if (minStock !== undefined && maxStock !== undefined && minStock > maxStock) {
      return res.status(400).json({ error: 'minStock cannot be greater than maxStock' });
    }

    const result = await db.run(
      `INSERT INTO inventory 
      (name, category, stock, minStock, maxStock, purchasePrice, salePrice, manufacturer, batchNo, expiryDate, manufacturingDate) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, category, stock, minStock, maxStock, purchasePrice, salePrice, manufacturer, batchNo, expiryDate, manufacturingDate]
    );
    
    res.status(201).json({ id: result.lastID });
  } catch (err) {
    console.error('Error creating inventory item:', err);
    res.status(500).json({ error: 'Failed to create inventory item', details: err.message });
  }
});

// Bulk import inventory items
router.post('/bulk-import', async (req, res) => {
  try {
    const items = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty items array' });
    }
    
    const errors = [];
    const imported = [];
    
    for (const item of items) {
      try {
        const result = await db.run(
          `INSERT INTO inventory 
          (name, category, stock, minStock, maxStock, purchasePrice, salePrice) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            item.name,
            item.category,
            item.stock || 0,
            item.minStock || 10,
            item.maxStock || 100,
            item.purchasePrice || 0,
            item.salePrice || 0
          ]
        );
        imported.push({ id: result.lastID, ...item });
      } catch (err) {
        errors.push({ item, error: err.message });
      }
    }
    
    res.json({
      imported: imported.length,
      failed: errors.length,
      errors
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, stock, minStock, maxStock, purchasePrice, salePrice, manufacturer, batchNo, expiryDate, manufacturingDate } = req.body;

    // Validation
    if (!name || !purchasePrice || !salePrice || stock === undefined) {
      return res.status(400).json({ error: 'name, purchasePrice, salePrice, and stock are required' });
    }

    if (purchasePrice <= 0 || salePrice <= 0) {
      return res.status(400).json({ error: 'purchasePrice and salePrice must be positive' });
    }

    if (minStock !== undefined && maxStock !== undefined && minStock > maxStock) {
      return res.status(400).json({ error: 'minStock cannot be greater than maxStock' });
    }

    const result = await db.run(
      `UPDATE inventory 
      SET name = ?, category = ?, stock = ?, minStock = ?, maxStock = ?, 
          purchasePrice = ?, salePrice = ?, manufacturer = ?, batchNo = ?,
          expiryDate = ?, manufacturingDate = ?
      WHERE id = ?`,
      [name, category, stock, minStock, maxStock, purchasePrice, salePrice, manufacturer, batchNo, expiryDate, manufacturingDate, id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    res.json({ message: 'Inventory item updated successfully' });
  } catch (err) {
    console.error('Error updating inventory item:', err);
    res.status(500).json({ error: 'Failed to update inventory item', details: err.message });
  }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if item exists
    const item = await db.get('SELECT * FROM inventory WHERE id = ?', [id]);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Delete the item
    const result = await db.run('DELETE FROM inventory WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Failed to delete inventory item' });
    }
    
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ error: 'Failed to delete inventory item', details: err.message });
  }
});

module.exports = router;
