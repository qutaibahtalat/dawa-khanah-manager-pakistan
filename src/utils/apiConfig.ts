// Centralized API configuration
const API_BASE_URL = 'http://localhost:3004';

export const API_ENDPOINTS = {
  MEDICINES: `${API_BASE_URL}/api/medicines`,
  DISTRIBUTORS: `${API_BASE_URL}/api/distributors`,
  INVENTORY: `${API_BASE_URL}/api/inventory`,
  POS_TRANSACTIONS: `${API_BASE_URL}/api/pos/transactions`,
  POS_CUSTOMERS: `${API_BASE_URL}/api/pos/customers`,
  REPORTS: `${API_BASE_URL}/api/reports`,
  HEALTH: `${API_BASE_URL}/api/health`
};

export default API_ENDPOINTS;
