import { StockManager } from '../utils/stockManager';
import { InventoryItem } from '../types/inventory';
import API_ENDPOINTS from '../utils/apiConfig';
import { Medicine, StockAdjustment } from '../types/medicine';

export class InventoryService {
  private stockManager = StockManager.getInstance();

  public async updateInventoryItem(item: InventoryItem): Promise<boolean> {
    try {
      // Update local inventory
      const success = this.stockManager.syncStock(item.medicineId, item.quantity, 'inventory');
      
      if (!success) {
        throw new Error('Failed to sync inventory changes');
      }
      
      return true;
    } catch (error) {
      console.error('Inventory update failed:', error);
      return false;
    }
  }

  public async getCurrentStock(medicineId: string): Promise<number> {
    return this.stockManager.getStock(medicineId);
  }

  public subscribeToStockChanges(callback: (medicineId: string, quantity: number) => void) {
    return this.stockManager.subscribeToStockChanges(callback);
  }

  // CRUD Operations
  async getInventory(): Promise<Medicine[]> {
    const response = await fetch(API_ENDPOINTS.INVENTORY);
    if (!response.ok) throw new Error('Failed to fetch inventory');
    return response.json();
  }

  async addItem(item: Omit<Medicine, 'id'>): Promise<Medicine> {
    const response = await fetch(API_ENDPOINTS.INVENTORY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!response.ok) throw new Error('Failed to add item');
    return response.json();
  }

  // Stock Management
  async adjustStock(adjustment: StockAdjustment): Promise<Medicine> {
    const response = await fetch(`${API_ENDPOINTS.INVENTORY}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adjustment)
    });
    if (!response.ok) throw new Error('Failed to adjust stock');
    return response.json();
  }

  // Validation Helpers
  validateItem(item: Partial<Medicine>): boolean {
    return !!(item.name && item.category && item.stock !== undefined);
  }
}

export const inventoryService = new InventoryService();
