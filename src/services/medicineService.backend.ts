// Backend API client for medicine/inventory management (async/await, network-synced)
import API_ENDPOINTS from '../utils/apiConfig';
import { Medicine, MedicineSupplierTransaction, MedicineCustomerTransaction, InvoiceTracking } from '../types/medicine';

export const medicineServiceBackend = {
  async bulkImportMedicines(medicines: any[]): Promise<{imported: number, failed: number, errors: any[]}> {
    const res = await fetch(`${API_ENDPOINTS.INVENTORY}/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medicines)
    });
    if (!res.ok) throw new Error('Bulk import failed');
    return res.json();
  },
  async getAll(): Promise<Medicine[]> {
    try {
      const res = await fetch(API_ENDPOINTS.MEDICINES);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch medicines');
      }
      return res.json();
    } catch (error) {
      console.error('MedicineService.getAll error:', error);
      throw error;
    }
  },
  async addMedicine(medicine: Omit<Medicine, 'id'>): Promise<Medicine> {
    try {
      const res = await fetch(API_ENDPOINTS.MEDICINES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicine)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add medicine');
      }
      return res.json();
    } catch (error) {
      console.error('MedicineService.addMedicine error:', error);
      throw error;
    }
  },
  async updateMedicine(medicine: Medicine): Promise<Medicine> {
    try {
      const res = await fetch(`${API_ENDPOINTS.MEDICINES}/${medicine.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicine)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update medicine');
      }
      return res.json();
    } catch (error) {
      console.error('MedicineService.updateMedicine error:', error);
      throw error;
    }
  },
  async deleteMedicine(id: string): Promise<void> {
    try {
      const res = await fetch(`${API_ENDPOINTS.MEDICINES}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete medicine');
      }
    } catch (error) {
      console.error('MedicineService.deleteMedicine error:', error);
      throw error;
    }
  },
  async addSupplierTransaction(transaction: Omit<MedicineSupplierTransaction, 'id'>): Promise<MedicineSupplierTransaction> {
    const res = await fetch(`${API_ENDPOINTS.MEDICINES}/supplier-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    if (!res.ok) throw new Error('Failed to add supplier transaction');
    return res.json();
  },
  async addCustomerTransaction(transaction: Omit<MedicineCustomerTransaction, 'id'>): Promise<MedicineCustomerTransaction> {
    const res = await fetch(`${API_ENDPOINTS.MEDICINES}/customer-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    if (!res.ok) throw new Error('Failed to add customer transaction');
    return res.json();
  },
  async getMedicineTraceability(medicineId: string): Promise<{
    supplierTransactions: MedicineSupplierTransaction[];
    customerTransactions: MedicineCustomerTransaction[];
  }> {
    const res = await fetch(`${API_ENDPOINTS.MEDICINES}/${medicineId}/traceability`);
    if (!res.ok) throw new Error('Failed to fetch medicine traceability');
    return res.json();
  },
  async trackByInvoice(invoiceNumber: string): Promise<InvoiceTracking | null> {
    const res = await fetch(`${API_ENDPOINTS.MEDICINES}/invoice/${invoiceNumber}`);
    if (!res.ok) throw new Error('Failed to fetch invoice tracking');
    return res.json();
  },
  async getHistoricalPurchaseData(medicineId: string): Promise<{
    lastPurchaseDate?: string;
    lastPurchasePrice?: number;
    lastSupplierName?: string;
    lastSalePrice?: number;
  }> {
    const res = await fetch(`${API_ENDPOINTS.MEDICINES}/${medicineId}/history`);
    if (!res.ok) throw new Error('Failed to fetch purchase history');
    return res.json();
  }
};
