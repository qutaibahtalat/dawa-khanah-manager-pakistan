const express = require('express');
const cors = require('cors');
const inventoryData = require('./testData/inventory.json');

const app = express();
app.use(cors());

// Mock inventory API endpoint
app.get('/api/inventory', (req, res) => {
  res.json(inventoryData);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.sendStatus(200);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
});
