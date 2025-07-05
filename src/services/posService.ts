import API_ENDPOINTS from '../utils/apiConfig';
import { InventoryService } from './InventoryService';
import { Receipt } from '../types/pos';

export const POSService = {
  async processTransaction(items: Array<{id: string, quantity: number}>, customerId?: string): Promise<Receipt> {
    // Process sale and update inventory
    const response = await fetch(API_ENDPOINTS.POS_TRANSACTIONS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, customerId })
    });
    
    if (!response.ok) throw new Error('Transaction failed');
    
    // Update local inventory cache
    await Promise.all(items.map(item => 
      InventoryService.adjustStock({
        medicineId: item.id,
        quantity: item.quantity,
        adjustmentType: 'remove',
        reason: 'POS sale'
      })
    ));
    
    return response.json();
  },
  
  async generateReceipt(transactionId: string): Promise<Blob> {
    const response = await fetch(`${API_ENDPOINTS.POS_TRANSACTIONS}/${transactionId}/receipt`);
    if (!response.ok) throw new Error('Failed to generate receipt');
    return response.blob();
  },
  
  async getCustomerHistory(customerId: string): Promise<any> {
    const response = await fetch(`${API_ENDPOINTS.POS_CUSTOMERS}/${customerId}/history`);
    if (!response.ok) throw new Error('Failed to fetch customer history');
    return response.json();
  }
};
