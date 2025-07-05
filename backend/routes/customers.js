const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory database for demo purposes
let customers = [];

// Get all customers
router.get('/', (req, res) => {
  const { mrNumber } = req.query;
  
  if (mrNumber) {
    const customer = customers.find(c => c.mrNumber === mrNumber);
    return customer ? res.json(customer) : res.status(404).send('Customer not found');
  }
  
  res.json(customers);
});

// Create new customer
router.post('/', (req, res) => {
  const newCustomer = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date(),
    totalCredit: req.body.totalCredit || 0,
    creditRemaining: req.body.creditRemaining || req.body.totalCredit || 0
  };
  
  customers.push(newCustomer);
  res.status(201).json(newCustomer);
});

// Update customer
router.put('/:id', (req, res) => {
  const index = customers.findIndex(c => c.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).send('Customer not found');
  }
  
  customers[index] = { ...customers[index], ...req.body };
  res.json(customers[index]);
});

module.exports = router;
