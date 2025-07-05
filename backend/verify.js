const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pharmacy.db');

// Verify database schema
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='inventory'", (err, tables) => {
  if (err) {
    console.error('Database error:', err);
    process.exit(1);
  }
  
  if (tables.length === 0) {
    console.error('Error: Inventory table not found');
    process.exit(1);
  }
  
  console.log('✅ Inventory table exists');
  
  // Verify API endpoints
  const http = require('http');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/health',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Health endpoint working');
      
      // Test inventory endpoint
      http.get('http://localhost:3001/api/inventory', (inventoryRes) => {
        let data = '';
        inventoryRes.on('data', (chunk) => data += chunk);
        inventoryRes.on('end', () => {
          try {
            JSON.parse(data);
            console.log('✅ Inventory endpoint working');
            process.exit(0);
          } catch (e) {
            console.error('Inventory endpoint error:', e);
            process.exit(1);
          }
        });
      });
    } else {
      console.error('Health endpoint failed:', res.statusCode);
      process.exit(1);
    }
  });
  
  req.on('error', (error) => {
    console.error('API test failed:', error);
    process.exit(1);
  });
  
  req.end();
});
