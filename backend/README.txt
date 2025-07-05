# Mindspire POS Backend Server

This is a minimal backend server for synchronizing data between multiple Electron POS clients on your LAN.

## How to Use

1. Open a terminal in the `backend` directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```
   - The server will run on port 3001 by default.
   - Make sure this port is open on your firewall.

4. On each client PC, point the Electron app to the server's LAN IP, e.g. `http://192.168.1.10:3001`

## API Endpoints
- `GET    /api/inventory` — List all inventory items
- `POST   /api/inventory` — Add new inventory item
- `PUT    /api/inventory/:id` — Update inventory item
- `DELETE /api/inventory/:id` — Delete inventory item
- `GET    /api/sales` — List all sales
- `POST   /api/sales` — Add new sale
- `GET    /api/health` — Health check

## Database
- Uses a local SQLite file (`pharmacy.db`) in the backend folder.
- Data is persistent and can be backed up by copying this file.

## Notes
- Run this server on ONE PC only (the "main server").
- All Electron clients must be able to reach this PC over the network.
- For more endpoints (customers, users, etc.), extend `server.js` as needed.
