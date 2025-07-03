const INVENTORY_STORAGE_KEY = 'pharmacy_inventory';

export interface InventoryItem {
  id: number;
  name: string;
  genericName: string;
  price: number;
  stock: number;
  barcode?: string;
  category?: string;
  manufacturer?: string;
  minStock?: number;
  maxStock?: number;
  purchasePrice?: number;
  salePrice?: number;
  batchNo?: string;
  expiryDate?: string;
  manufacturingDate?: string;
  supplierName?: string;
}

export const getInventory = (): InventoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(INVENTORY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

export const saveInventory = (items: InventoryItem[]): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }
};

export const updateItemStock = (id: number, quantity: number): boolean => {
  const items = getInventory();
  const itemIndex = items.findIndex(item => item.id === id);
  
  if (itemIndex === -1) return false;
  
  const newStock = items[itemIndex].stock + quantity;
  if (newStock < 0) return false; // Prevent negative stock
  
  const updatedItems = [...items];
  updatedItems[itemIndex] = {
    ...updatedItems[itemIndex],
    stock: newStock
  };
  
  saveInventory(updatedItems);
  return true;
};

export const getLowStockItems = (threshold: number = 10): InventoryItem[] => {
  const items = getInventory();
  return items.filter(item => item.stock <= (item.minStock || threshold));
};

export const searchInventory = (query: string): InventoryItem[] => {
  const items = getInventory();
  if (!query) return items;
  
  const queryLower = query.toLowerCase();
  return items.filter(item => 
    item.name.toLowerCase().includes(queryLower) ||
    (item.genericName?.toLowerCase().includes(queryLower) ?? false) ||
    (item.barcode?.includes(query) ?? false)
  );
};
