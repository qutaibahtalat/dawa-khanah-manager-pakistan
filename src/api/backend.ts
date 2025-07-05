// Minimal API client for Mindspire POS backend
// Change BASE_URL to match your server PC's LAN IP (e.g., http://192.168.1.10:3001)

// Dynamically get backend base URL from preload (auto-detects server/client)
// TypeScript: declare window.api for Electron preload context
declare global {
  interface Window {
    api?: {
      getBackendBaseUrl: () => string;
    };
  }
}

function getBaseUrl() {
  if (typeof window !== 'undefined' && window.api && window.api.getBackendBaseUrl) {
    return window.api.getBackendBaseUrl();
  }
  return 'http://localhost:3001/api';
}
const BASE_URL = getBaseUrl();

export async function getInventory() {
  const res = await fetch(`${BASE_URL}/inventory`);
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return res.json();
}

export async function addInventory(item: { name: string; stock: number; price: number }) {
  const res = await fetch(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error('Failed to add inventory item');
  return res.json();
}

export async function updateInventory(id: number, item: { name: string; stock: number; price: number }) {
  const res = await fetch(`${BASE_URL}/inventory/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error('Failed to update inventory');
  return res.json();
}

export async function deleteInventory(id: number) {
  const res = await fetch(`${BASE_URL}/inventory/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete inventory');
  return res.json();
}

export async function getSales() {
  const res = await fetch(`${BASE_URL}/sales`);
  if (!res.ok) throw new Error('Failed to fetch sales');
  return res.json();
}

export async function addSale(sale: { item_id: number; quantity: number; total: number; date: string }) {
  const res = await fetch(`${BASE_URL}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sale)
  });
  if (!res.ok) throw new Error('Failed to add sale');
  return res.json();
}
