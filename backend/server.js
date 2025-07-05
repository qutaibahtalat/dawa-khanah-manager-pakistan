const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const logStream = fs.createWriteStream('server.log', { flags: 'a' });
const customerRoutes = require('./routes/customers'); // Import the customer routes at the top
const inventoryRoutes = require('./routes/inventoryRoutes'); // Import the inventory routes at the top

const app = express();
const PORT = 3004;

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'pharmacy.db'), (err) => {
  const timestamp = new Date().toISOString();
  if (err) {
    logStream.write(`${timestamp} - Database error: ${err.message}\n`);
    console.error('Error opening database:', err.message);
  } else {
    logStream.write(`${timestamp} - Connected to SQLite DB\n`);
    console.log('Connected to SQLite DB');
    
    // Create tables if they don't exist
    const createTables = [
      `CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        position TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        salary REAL,
        status TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        stock INTEGER DEFAULT 0,
        minStock INTEGER,
        maxStock INTEGER,
        purchasePrice REAL,
        salePrice REAL,
        manufacturer TEXT,
        batchNo TEXT,
        expiryDate TEXT,
        manufacturingDate TEXT,
        bonus REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        distributorName TEXT,
        status TEXT DEFAULT 'pending',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER,
        quantity INTEGER,
        total_price REAL,
        date TEXT,
        FOREIGN KEY(item_id) REFERENCES inventory(id)
      )`,
      `CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        date TEXT,
        clockIn TEXT,
        clockOut TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mrNumber TEXT UNIQUE,
        name TEXT,
        phone TEXT,
        address TEXT,
        totalCredit REAL DEFAULT 0,
        creditRemaining REAL DEFAULT 0,
        lastVisitDate TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS distributors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT,
        email TEXT,
        address TEXT
      )`
    ];

    // After creating tables, check and add missing columns
    const addMissingColumns = () => {
      const addColumn = (table, column, type) => {
        return new Promise((resolve, reject) => {
          db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`, (err) => {
            // Ignore error if column already exists
            resolve();
          });
        });
      };

      return Promise.all([
        addColumn('staff', 'email', 'TEXT'),
        addColumn('staff', 'address', 'TEXT'),
        addColumn('inventory', 'category', 'TEXT')
      ]);
    };

    // Execute table creation sequentially
    const createTable = (index) => {
      if (index >= createTables.length) {
        // After tables are created, add missing columns
        return addMissingColumns().then(() => {
          console.log('Database initialized successfully');
        });
      }
      
      return new Promise((resolve, reject) => {
        db.run(createTables[index], (err) => {
          if (err) {
            console.error(`Failed to create table ${index}:`, err);
            reject(err);
          } else {
            createTable(index + 1).then(resolve).catch(reject);
          }
        });
      });
    };

    createTable(0)
      .then(() => console.log('Database initialized successfully'))
      .catch(err => console.error('Database initialization failed:', err));
  }
});

// Enhanced database initialization
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create all tables with error handling
      const tables = [
        `CREATE TABLE IF NOT EXISTS staff (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          position TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT,
          address TEXT,
          salary REAL NOT NULL,
          status TEXT NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS inventory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category TEXT,
          stock INTEGER DEFAULT 0,
          minStock INTEGER,
          maxStock INTEGER,
          purchasePrice REAL,
          salePrice REAL,
          manufacturer TEXT,
          batchNo TEXT,
          expiryDate TEXT,
          manufacturingDate TEXT,
          bonus REAL DEFAULT 0,
          discount REAL DEFAULT 0,
          distributorName TEXT,
          status TEXT DEFAULT 'pending',
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS sales (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER,
          payment_method TEXT,
          total_amount REAL,
          discount REAL DEFAULT 0,
          status TEXT DEFAULT 'completed',
          date TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(customer_id) REFERENCES customers(id)
        )`,
        `CREATE TABLE IF NOT EXISTS sale_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sale_id INTEGER,
          inventory_id INTEGER,
          quantity INTEGER,
          unit_price REAL,
          FOREIGN KEY(sale_id) REFERENCES sales(id),
          FOREIGN KEY(inventory_id) REFERENCES inventory(id)
        )`,
        `CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER,
          date TEXT,
          clockIn TEXT,
          clockOut TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mrNumber TEXT UNIQUE,
          name TEXT,
          phone TEXT,
          address TEXT,
          totalCredit REAL DEFAULT 0,
          creditRemaining REAL DEFAULT 0,
          lastVisitDate TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS distributors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          phone TEXT,
          email TEXT,
          address TEXT
        )`
      ];

      // Execute table creation sequentially
      const createTables = (index) => {
        if (index >= tables.length) return resolve();
        
        db.run(tables[index], (err) => {
          if (err) {
            console.error(`Failed to create table ${index}:`, err);
            return reject(err);
          }
          createTables(index + 1);
        });
      };
      
      createTables(0);
    });
  });
};

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mount routes
const posRoutes = require('./routes/posRoutes');
const reportsRoutes = require('./routes/reportsRoutes');

app.use('/api/medicines', inventoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/reports', reportsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// --- Staff Endpoints ---
app.get('/api/staff', (req, res) => {
  console.log('Attempting to fetch staff from database');
  db.all('PRAGMA table_info(staff);', [], (err, tableInfo) => {
    if (err) {
      console.error('Error checking staff table schema:', err);
      return res.status(500).json({ error: 'Database schema error' });
    }
    console.log('Staff table schema:', tableInfo);
    
    db.all('SELECT * FROM staff', [], (err, rows) => {
      if (err) {
        console.error('Database error fetching staff:', err);
        return res.status(500).json({ 
          error: err.message,
          details: 'Failed to execute staff query'
        });
      }
      console.log('Successfully fetched', rows.length, 'staff members');
      res.json(rows);
    });
  });
});

app.post('/api/staff', (req, res) => {
  console.log('Attempting to create staff member:', req.body);
  const { name, position, phone, salary, status } = req.body;

  // Strict input validation
  const validStatus = (status === 'active' || status === 'inactive' || status === 'Active' || status === 'Inactive');
  if (!name || typeof name !== 'string' || !position || typeof position !== 'string' || !phone || typeof phone !== 'string' || !salary || isNaN(Number(salary)) || !status || !validStatus) {
    console.error('Validation error: Missing or invalid staff fields', req.body);
    return res.status(400).json({
      message: 'Invalid staff data. Please fill all required fields correctly.',
      error: 'Validation error: Missing or invalid staff fields',
      details: {
        name: typeof name,
        position: typeof position,
        phone: typeof phone,
        salary: typeof salary,
        status: status
      }
    });
  }

  db.run(
    'INSERT INTO staff (name, position, phone, email, address, salary, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, position, phone, req.body.email || '', req.body.address || '', Number(salary), status],
    function(err) {
      if (err) {
        console.error('Database error creating staff:', err);
        return res.status(500).json({ error: err.message });
      }
      console.log('Successfully created staff member with ID:', this.lastID);
      res.json({ id: this.lastID });
    }
  );
});

// --- Attendance Endpoints ---
app.post('/api/attendance/clock-in', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }
  
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0];
  
  db.run(
    'INSERT INTO attendance (userId, date, clockIn) VALUES (?, ?, ?)',
    [userId, date, time],
    function(err) {
      if (err) {
        console.error('Error clocking in:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID });
    }
  );
});

app.post('/api/attendance/clock-out', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }
  
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0];
  
  db.run(
    'UPDATE attendance SET clockOut = ? WHERE userId = ? AND date = ? AND clockOut IS NULL',
    [time, userId, date],
    function(err) {
      if (err) {
        console.error('Error clocking out:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(400).json({ error: 'No active clock-in found' });
      }
      res.json({ success: true });
    }
  );
});

app.get('/api/attendance/monthly', (req, res) => {
  const { userId, month, year } = req.query;
  if (!userId || !month || !year) {
    return res.status(400).json({ error: 'User ID, month, and year required' });
  }
  
  const startDate = `${year}-${month.padStart(2, '0')}-01`;
  const endDate = `${year}-${month.padStart(2, '0')}-31`;
  
  db.all(
    'SELECT * FROM attendance WHERE userId = ? AND date BETWEEN ? AND ?',
    [userId, startDate, endDate],
    (err, rows) => {
      if (err) {
        console.error('Error fetching attendance:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// --- Distributors Endpoints ---
app.get('/api/distributors', (req, res) => {
  db.all('SELECT * FROM distributors', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// --- Enhanced Health Check ---
app.get('/api/health/deep', (req, res) => {
  db.serialize(() => {
    db.get('SELECT name FROM sqlite_master WHERE type="table" AND name="staff"', [], (err, row) => {
      if (err) {
        console.error('Health check failed:', err);
        return res.status(500).json({ 
          status: 'error',
          error: err.message,
          details: 'Failed to check staff table existence'
        });
      }
      
      if (!row) {
        return res.status(500).json({
          status: 'error',
          error: 'Staff table does not exist'
        });
      }
      
      // Test simple query
      db.get('SELECT COUNT(*) as count FROM staff', [], (err, row) => {
        if (err) {
          console.error('Health check query failed:', err);
          return res.status(500).json({
            status: 'error',
            error: err.message,
            details: 'Failed to execute test query'
          });
        }
        
        res.json({
          status: 'ok',
          tables: ['staff'],
          staffCount: row.count
        });
      });
    });
  });
});

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Call initialization before starting server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      const timestamp = new Date().toISOString();
      logStream.write(`${timestamp} - Server started on port ${PORT}\n`);
      console.log(`Server running on port ${PORT}`);
    }).on('error', (err) => {
      const timestamp = new Date().toISOString();
      logStream.write(`${timestamp} - Server error: ${err.message}\n`);
      console.error('Server failed to start:', err);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
