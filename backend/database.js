const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'pharmacy.db');
const db = new sqlite3.Database(dbPath);

// Promisify database methods
const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const createInventoryTable = `
  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    stock INTEGER NOT NULL,
    minStock INTEGER,
    maxStock INTEGER,
    purchasePrice REAL NOT NULL,
    salePrice REAL NOT NULL,
    manufacturer TEXT,
    batchNo TEXT,
    expiryDate TEXT,
    manufacturingDate TEXT,
    bonus REAL,
    discount REAL,
    distributorName TEXT,
    status TEXT DEFAULT 'pending',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`;

db.run(createInventoryTable, (err) => {
  if (err) console.error('Error creating inventory table:', err);
  else console.log('Inventory table verified');
});

module.exports = {
  all,
  run,
  get,
  db
};
