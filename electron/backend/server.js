// This is a copy of your backend server for LAN sync, bundled with Electron.
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3001;

const db = new sqlite3.Database(path.join(__dirname, 'pharmacy.db'), (err) => {
  if (err) {
    console.error('Failed to connect to SQLite DB:', err);
  } else {
    console.log('Connected to SQLite DB');
  }
});

db.serialize(() => {
  // --- Tax Config & Returns ---
  db.run(`CREATE TABLE IF NOT EXISTS tax_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    enabled INTEGER DEFAULT 1,
    rate REAL DEFAULT 0.17,
    inclusive INTEGER DEFAULT 0
  )`);
  db.run(`INSERT OR IGNORE INTO tax_config (id) VALUES (1)`);
  db.run(`CREATE TABLE IF NOT EXISTS tax_returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT,
    type TEXT,
    amount REAL,
    dueDate TEXT,
    status TEXT,
    submittedDate TEXT
  )`);
  // --- Prescriptions ---
  db.run(`CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patientName TEXT,
    patientAge INTEGER,
    patientGender TEXT,
    doctorName TEXT,
    doctorLicense TEXT,
    hospitalName TEXT,
    prescriptionDate TEXT,
    medicines TEXT,
    diagnosis TEXT,
    instructions TEXT,
    status TEXT,
    customerId TEXT,
    dispensedBy TEXT,
    dispensedDate TEXT,
    imageUrl TEXT
  )`);
  // --- Returns ---
  db.run(`CREATE TABLE IF NOT EXISTS returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT,
    companyName TEXT,
    medicineName TEXT,
    price TEXT,
    date TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS supplier_returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    companyName TEXT,
    supplierName TEXT,
    totalStockPrice REAL,
    totalStockQuantity INTEGER,
    date TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    price REAL DEFAULT 0
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER,
    quantity INTEGER,
    total REAL,
    date TEXT,
    FOREIGN KEY(item_id) REFERENCES inventory(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    companyName TEXT,
    contactPerson TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    taxId TEXT,
    currentBalance REAL DEFAULT 0,
    status TEXT DEFAULT 'active'
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS supplier_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplierId INTEGER,
    medicineId TEXT,
    medicineName TEXT,
    batchNumber TEXT,
    quantity INTEGER,
    unitPrice REAL,
    totalCost REAL,
    status TEXT,
    createdAt TEXT,
    updatedAt TEXT,
    expectedDelivery TEXT,
    actualDelivery TEXT,
    receivedQuantity INTEGER,
    notes TEXT,
    FOREIGN KEY(supplierId) REFERENCES suppliers(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS supplier_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplierId INTEGER,
    orderId INTEGER,
    amount REAL,
    date TEXT,
    method TEXT,
    reference TEXT,
    notes TEXT,
    status TEXT,
    createdAt TEXT,
    FOREIGN KEY(supplierId) REFERENCES suppliers(id),
    FOREIGN KEY(orderId) REFERENCES supplier_orders(id)
  )`);
});

app.use(cors());
app.use(bodyParser.json());

// --- TAX CONFIG ENDPOINTS ---
app.get('/api/tax-config', (req, res) => {
  db.get('SELECT * FROM tax_config WHERE id=1', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});
app.put('/api/tax-config', (req, res) => {
  const { enabled, rate, inclusive } = req.body;
  db.run('UPDATE tax_config SET enabled=?, rate=?, inclusive=? WHERE id=1', [enabled ? 1 : 0, rate, inclusive ? 1 : 0], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// --- TAX RETURNS ENDPOINTS ---
app.get('/api/tax-returns', (req, res) => {
  db.all('SELECT * FROM tax_returns', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/api/tax-returns', (req, res) => {
  const { period, type, amount, dueDate, status, submittedDate } = req.body;
  db.run('INSERT INTO tax_returns (period, type, amount, dueDate, status, submittedDate) VALUES (?, ?, ?, ?, ?, ?)', [period, type, amount, dueDate, status, submittedDate], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});
app.put('/api/tax-returns/:id', (req, res) => {
  const { period, type, amount, dueDate, status, submittedDate } = req.body;
  db.run('UPDATE tax_returns SET period=?, type=?, amount=?, dueDate=?, status=?, submittedDate=? WHERE id=?', [period, type, amount, dueDate, status, submittedDate, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});
app.delete('/api/tax-returns/:id', (req, res) => {
  db.run('DELETE FROM tax_returns WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// --- PRESCRIPTIONS ENDPOINTS ---
app.get('/api/prescriptions', (req, res) => {
  db.all('SELECT * FROM prescriptions', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Parse medicines JSON for each prescription
    rows.forEach(row => {
      if (row.medicines) {
        try { row.medicines = JSON.parse(row.medicines); } catch { row.medicines = []; }
      }
    });
    res.json(rows);
  });
});
app.post('/api/prescriptions', (req, res) => {
  const { patientName, patientAge, patientGender, doctorName, doctorLicense, hospitalName, prescriptionDate, medicines, diagnosis, instructions, status, customerId, dispensedBy, dispensedDate, imageUrl } = req.body;
  db.run('INSERT INTO prescriptions (patientName, patientAge, patientGender, doctorName, doctorLicense, hospitalName, prescriptionDate, medicines, diagnosis, instructions, status, customerId, dispensedBy, dispensedDate, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [patientName, patientAge, patientGender, doctorName, doctorLicense, hospitalName, prescriptionDate, JSON.stringify(medicines), diagnosis, instructions, status, customerId, dispensedBy, dispensedDate, imageUrl],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});
app.put('/api/prescriptions/:id', (req, res) => {
  const { patientName, patientAge, patientGender, doctorName, doctorLicense, hospitalName, prescriptionDate, medicines, diagnosis, instructions, status, customerId, dispensedBy, dispensedDate, imageUrl } = req.body;
  db.run('UPDATE prescriptions SET patientName=?, patientAge=?, patientGender=?, doctorName=?, doctorLicense=?, hospitalName=?, prescriptionDate=?, medicines=?, diagnosis=?, instructions=?, status=?, customerId=?, dispensedBy=?, dispensedDate=?, imageUrl=? WHERE id=?',
    [patientName, patientAge, patientGender, doctorName, doctorLicense, hospitalName, prescriptionDate, JSON.stringify(medicines), diagnosis, instructions, status, customerId, dispensedBy, dispensedDate, imageUrl, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ changes: this.changes });
    });
});
app.delete('/api/prescriptions/:id', (req, res) => {
  db.run('DELETE FROM prescriptions WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// --- RETURNS ENDPOINTS ---
app.get('/api/returns', (req, res) => {
  db.all('SELECT * FROM returns', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/api/returns', (req, res) => {
  const { customerName, companyName, medicineName, price, date } = req.body;
  db.run('INSERT INTO returns (customerName, companyName, medicineName, price, date) VALUES (?, ?, ?, ?, ?)', [customerName, companyName, medicineName, price, date], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});
app.delete('/api/returns/:id', (req, res) => {
  db.run('DELETE FROM returns WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});
// --- SUPPLIER RETURNS ENDPOINTS ---
app.get('/api/supplier-returns', (req, res) => {
  db.all('SELECT * FROM supplier_returns', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/api/supplier-returns', (req, res) => {
  const { companyName, supplierName, totalStockPrice, totalStockQuantity, date } = req.body;
  db.run('INSERT INTO supplier_returns (companyName, supplierName, totalStockPrice, totalStockQuantity, date) VALUES (?, ?, ?, ?, ?)', [companyName, supplierName, totalStockPrice, totalStockQuantity, date], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});
app.delete('/api/supplier-returns/:id', (req, res) => {
  db.run('DELETE FROM supplier_returns WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// --- Supplier Endpoints ---
app.get('/api/suppliers', (req, res) => {
  db.all('SELECT * FROM suppliers', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/suppliers', (req, res) => {
  const { name, companyName, contactPerson, phone, email, address, taxId, status } = req.body;
  db.run('INSERT INTO suppliers (name, companyName, contactPerson, phone, email, address, taxId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [name, companyName, contactPerson, phone, email, address, taxId, status || 'active'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

app.put('/api/suppliers/:id', (req, res) => {
  const { name, companyName, contactPerson, phone, email, address, taxId, currentBalance, status } = req.body;
  db.run('UPDATE suppliers SET name=?, companyName=?, contactPerson=?, phone=?, email=?, address=?, taxId=?, currentBalance=?, status=? WHERE id=?',
    [name, companyName, contactPerson, phone, email, address, taxId, currentBalance, status, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ changes: this.changes });
    });
});

app.delete('/api/suppliers/:id', (req, res) => {
  db.run('DELETE FROM suppliers WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// --- Supplier Orders Endpoints ---
app.get('/api/supplier-orders', (req, res) => {
  db.all('SELECT * FROM supplier_orders', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/supplier-orders', (req, res) => {
  const { supplierId, medicineId, medicineName, batchNumber, quantity, unitPrice, totalCost, status, createdAt, updatedAt, expectedDelivery, actualDelivery, receivedQuantity, notes } = req.body;
  db.run(`INSERT INTO supplier_orders (supplierId, medicineId, medicineName, batchNumber, quantity, unitPrice, totalCost, status, createdAt, updatedAt, expectedDelivery, actualDelivery, receivedQuantity, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [supplierId, medicineId, medicineName, batchNumber, quantity, unitPrice, totalCost, status, createdAt, updatedAt, expectedDelivery, actualDelivery, receivedQuantity, notes],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

app.put('/api/supplier-orders/:id', (req, res) => {
  const { status, updatedAt, actualDelivery, receivedQuantity, notes } = req.body;
  db.run('UPDATE supplier_orders SET status=?, updatedAt=?, actualDelivery=?, receivedQuantity=?, notes=? WHERE id=?',
    [status, updatedAt, actualDelivery, receivedQuantity, notes, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ changes: this.changes });
    });
});

// --- Supplier Payments Endpoints ---
app.get('/api/supplier-payments', (req, res) => {
  db.all('SELECT * FROM supplier_payments', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/supplier-payments', (req, res) => {
  const { supplierId, orderId, amount, date, method, reference, notes, status, createdAt } = req.body;
  db.run('INSERT INTO supplier_payments (supplierId, orderId, amount, date, method, reference, notes, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [supplierId, orderId, amount, date, method, reference, notes, status, createdAt],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

app.get('/api/inventory', (req, res) => {
  db.all('SELECT * FROM inventory', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/inventory', (req, res) => {
  const { name, stock, price } = req.body;
  db.run('INSERT INTO inventory (name, stock, price) VALUES (?, ?, ?)', [name, stock, price], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.put('/api/inventory/:id', (req, res) => {
  const { name, stock, price } = req.body;
  db.run('UPDATE inventory SET name=?, stock=?, price=? WHERE id=?', [name, stock, price, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

app.delete('/api/inventory/:id', (req, res) => {
  db.run('DELETE FROM inventory WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

app.get('/api/sales', (req, res) => {
  db.all('SELECT * FROM sales', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/sales', (req, res) => {
  const { item_id, quantity, total, date } = req.body;
  db.run('INSERT INTO sales (item_id, quantity, total, date) VALUES (?, ?, ?, ?)', [item_id, quantity, total, date], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// --- Customers Endpoints ---
app.get('/api/customers', (req, res) => {
  db.all('SELECT * FROM customers', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/customers', (req, res) => {
  const { name, phone, address, creditLimit } = req.body;
  db.run('INSERT INTO customers (name, phone, address, creditLimit) VALUES (?, ?, ?, ?)', [name, phone, address, creditLimit], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.put('/api/customers/:id', (req, res) => {
  const { name, phone, address, creditLimit } = req.body;
  db.run('UPDATE customers SET name=?, phone=?, address=?, creditLimit=? WHERE id=?', [name, phone, address, creditLimit, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

app.delete('/api/customers/:id', (req, res) => {
  db.run('DELETE FROM customers WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// --- Staff Endpoints ---
app.get('/api/staff', (req, res) => {
  db.all('SELECT * FROM staff', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/staff', (req, res) => {
  const { name, role, phone, salary } = req.body;
  db.run('INSERT INTO staff (name, role, phone, salary) VALUES (?, ?, ?, ?)', [name, role, phone, salary], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.put('/api/staff/:id', (req, res) => {
  const { name, role, phone, salary } = req.body;
  db.run('UPDATE staff SET name=?, role=?, phone=?, salary=? WHERE id=?', [name, role, phone, salary, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

app.delete('/api/staff/:id', (req, res) => {
  db.run('DELETE FROM staff WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// --- Loyalty Endpoints ---
app.get('/api/loyalty', (req, res) => {
  db.all('SELECT * FROM loyalty', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/loyalty', (req, res) => {
  const { customerId, points, tier, totalSpent, lastPurchase } = req.body;
  db.run('INSERT INTO loyalty (customerId, points, tier, totalSpent, lastPurchase) VALUES (?, ?, ?, ?, ?)', [customerId, points, tier, totalSpent, lastPurchase], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.put('/api/loyalty/:customerId', (req, res) => {
  const { points, tier, totalSpent, lastPurchase } = req.body;
  db.run('UPDATE loyalty SET points=?, tier=?, totalSpent=?, lastPurchase=? WHERE customerId=?', [points, tier, totalSpent, lastPurchase, req.params.customerId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// --- Settings Endpoints ---
app.get('/api/settings', (req, res) => {
  db.all('SELECT * FROM settings', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/settings', (req, res) => {
  const { key, value } = req.body;
  db.run('INSERT INTO settings (key, value) VALUES (?, ?)', [key, value], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.put('/api/settings/:key', (req, res) => {
  const { value } = req.body;
  db.run('UPDATE settings SET value=? WHERE key=?', [value, req.params.key], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// --- Prescriptions Endpoints ---
app.get('/api/prescriptions', (req, res) => {
  db.all('SELECT * FROM prescriptions', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/prescriptions', (req, res) => {
  const { patientName, doctorName, date, status, medicines } = req.body;
  db.run('INSERT INTO prescriptions (patientName, doctorName, date, status, medicines) VALUES (?, ?, ?, ?, ?)', [patientName, doctorName, date, status, JSON.stringify(medicines)], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.put('/api/prescriptions/:id', (req, res) => {
  const { patientName, doctorName, date, status, medicines } = req.body;
  db.run('UPDATE prescriptions SET patientName=?, doctorName=?, date=?, status=?, medicines=? WHERE id=?', [patientName, doctorName, date, status, JSON.stringify(medicines), req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

app.delete('/api/prescriptions/:id', (req, res) => {
  db.run('DELETE FROM prescriptions WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Mindspire POS backend running on port ${PORT}`);
});
