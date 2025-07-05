import { Supplier, SupplierOrder, SupplierPayment } from '@/types/supplier';

type CreateOrderParams = {
  supplierId: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  expectedDelivery: Date;
  notes?: string;
};

type RecordPaymentParams = {
  supplierId: string;
  orderId?: string;
  amount: number;
  date: Date;
  method: 'cash' | 'bank_transfer' | 'cheque' | 'credit' | 'other';
  reference?: string;
  notes?: string;
  status?: 'completed' | 'pending' | 'failed' | 'refunded';
};

function getBackendBaseUrl() {
  // @ts-ignore
  if (window?.electronAPI?.getBackendBaseUrl) {
    // @ts-ignore
    return window.electronAPI.getBackendBaseUrl();
  }
  return 'http://localhost:3001/api';
}

export const supplierService = {
  // --- SUPPLIERS CRUD ---
  async getAllSuppliers(): Promise<Supplier[]> {
    const res = await fetch(`${getBackendBaseUrl()}/suppliers`);
    return res.json();
  },
  async createSupplier(supplier: Partial<Supplier>): Promise<{ id: number }> {
    const res = await fetch(`${getBackendBaseUrl()}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supplier)
    });
    return res.json();
  },
  async updateSupplier(id: number, supplier: Partial<Supplier>): Promise<any> {
    const res = await fetch(`${getBackendBaseUrl()}/suppliers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supplier)
    });
    return res.json();
  },
  async deleteSupplier(id: number): Promise<any> {
    const res = await fetch(`${getBackendBaseUrl()}/suppliers/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // --- SUPPLIER ORDERS ---
  async createOrder(order: CreateOrderParams): Promise<SupplierOrder> {
    const now = new Date().toISOString();
    const res = await fetch(`${getBackendBaseUrl()}/supplier-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...order,
        totalCost: order.quantity * order.unitPrice,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        actualDelivery: null,
        receivedQuantity: 0
      })
    });
    const result = await res.json();
    return { ...order, id: result.id, totalCost: order.quantity * order.unitPrice, status: 'pending', createdAt: now, updatedAt: now, actualDelivery: null, receivedQuantity: 0 };
  },
  async getOrdersBySupplier(supplierId: string): Promise<SupplierOrder[]> {
    const res = await fetch(`${getBackendBaseUrl()}/supplier-orders`);
    const allOrders = await res.json();
    return allOrders.filter((order: SupplierOrder) => order.supplierId == supplierId)
      .sort((a: SupplierOrder, b: SupplierOrder) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  async updateOrderStatus(orderId: number, status: 'pending' | 'delivered' | 'cancelled' | 'partially_delivered', receivedQuantity?: number, notes?: string): Promise<any> {
    const now = new Date().toISOString();
    const actualDelivery = (status === 'delivered' || status === 'partially_delivered') ? now : null;
    const res = await fetch(`${getBackendBaseUrl()}/supplier-orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, updatedAt: now, actualDelivery, receivedQuantity, notes })
    });
    return res.json();
  },

  // --- SUPPLIER PAYMENTS ---
  async recordPayment(payment: RecordPaymentParams): Promise<SupplierPayment> {
    const now = new Date().toISOString();
    const res = await fetch(`${getBackendBaseUrl()}/supplier-payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payment, status: payment.status || 'completed', createdAt: now })
    });
    const result = await res.json();
    return { ...payment, id: result.id, status: payment.status || 'completed', createdAt: now } as SupplierPayment;
  },
  async getPaymentsBySupplier(supplierId: string): Promise<SupplierPayment[]> {
    const res = await fetch(`${getBackendBaseUrl()}/supplier-payments`);
    const allPayments = await res.json();
    return allPayments.filter((p: SupplierPayment) => p.supplierId == supplierId)
      .sort((a: SupplierPayment, b: SupplierPayment) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // --- BALANCE ---
  async updateSupplierBalance(supplierId: number, amount: number): Promise<any> {
    // Fetch supplier, update balance, then PUT
    const suppliers = await this.getAllSuppliers();
    const supplier = suppliers.find((s) => s.id == supplierId);
    if (!supplier) return;
    supplier.currentBalance = (supplier.currentBalance || 0) + amount;
    return this.updateSupplier(supplierId, { currentBalance: supplier.currentBalance });
  },
  async getSupplierBalance(supplierId: string): Promise<number> {
    const suppliers = await this.getAllSuppliers();
    const supplier = suppliers.find((s) => s.id == supplierId);
    return supplier?.currentBalance || 0;
  }
};
