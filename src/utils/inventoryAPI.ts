import { getBackendBaseUrl } from './returnsStorage';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  maxStock: number;
  purchasePrice: number;
  salePrice: number;
  manufacturer: string;
  batchNo?: string;
  expiryDate?: string;
  manufacturingDate?: string;
  bonus?: number;
  discount?: number;
  distributorName?: string;
}

export const fetchInventory = async (): Promise<InventoryItem[]> => {
  try {
    const response = await fetch(`${getBackendBaseUrl()}/api/inventory`);
    
    if (!response.ok) {
      console.error('API Error:', await response.text());
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid inventory data format');
    }
    
    return data;
  } catch (error) {
    console.error('Fetch Inventory Failed:', error);
    throw error;
  }
};

export const createInventoryItem = async (item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
  try {
    const response = await fetch(`${getBackendBaseUrl()}/api/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!response.ok) {
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Create Inventory Item Failed:', error);
    throw error;
  }
};

export const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> => {
  try {
    const response = await fetch(`${getBackendBaseUrl()}/api/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Update Inventory Item Failed:', error);
    throw error;
  }
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${getBackendBaseUrl()}/api/inventory/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Delete Inventory Item Failed:', error);
    throw error;
  }
};
