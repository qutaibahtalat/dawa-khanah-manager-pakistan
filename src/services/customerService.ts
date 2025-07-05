import { Customer, CustomerHistory } from '@/types/customer';

import { Customer, CustomerHistory } from '@/types/customer';
// getBackendBaseUrl is not exported from backend.ts; define it here for compatibility
function getBackendBaseUrl() {
  if (typeof window !== 'undefined' && window.api && window.api.getBackendBaseUrl) {
    return window.api.getBackendBaseUrl();
  }
  return 'http://localhost:3001/api';
}

export const customerService = {
  // Fetch all customers from backend
  async getCustomers(): Promise<Customer[]> {
    const res = await fetch(`${getBackendBaseUrl()}/customers`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  // Fetch a single customer by MR number
  async getCustomer(mrNumber: string): Promise<Customer | undefined> {
    const customers = await this.getCustomers();
    return customers.find(c => c.mrNumber === mrNumber);
  },

  // Add a new customer
  async addCustomer(customer: Omit<Customer, 'createdAt'>): Promise<Customer> {
    const res = await fetch(`${getBackendBaseUrl()}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });
    if (!res.ok) throw new Error('Failed to add customer');
    return res.json();
  },

  // Update customer credit
  async updateCredit(mrNumber: string, amount: number): Promise<Customer> {
    const customer = await this.getCustomer(mrNumber);
    if (!customer) throw new Error('Customer not found');
    const updated = { ...customer, creditRemaining: customer.creditRemaining + amount };
    const res = await fetch(`${getBackendBaseUrl()}/customers/${customer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (!res.ok) throw new Error('Failed to update credit');
    return res.json();
  },

  // Fetch customer history (stub: implement as needed)
  async getCustomerHistory(mrNumber: string): Promise<CustomerHistory[]> {
    // Replace with backend call if endpoint exists
    return [];
  },

  // Add history entry (stub: implement as needed)
  async addHistoryEntry(entry: Omit<CustomerHistory, 'id' | 'date'>): Promise<CustomerHistory> {
    // Replace with backend call if endpoint exists
    return { ...entry, id: '', date: new Date().toISOString() } as CustomerHistory;
  },

  // Log visit (stub: implement as needed)
  async logVisit(mrNumber: string, note?: string): Promise<void> {
    // Replace with backend call if endpoint exists
  },

  // Get visit history (stub: implement as needed)
  async getVisitHistory(mrNumber: string): Promise<any[]> {
    // Replace with backend call if endpoint exists
    return [];
  }
};
  },

  getCustomer(mrNumber: string) {
    return this.customers.find(c => c.mrNumber === mrNumber);
  },

  addCustomer(customer: Omit<Customer, 'createdAt'>) {
    const newCustomer = {
      ...customer,
      createdAt: new Date()
    };
    this.customers.push(newCustomer);
    return newCustomer;
  },

  // Credit management
  updateCredit(mrNumber: string, amount: number) {
    const customer = this.getCustomer(mrNumber);
    if (customer) {
      customer.creditRemaining += amount;
      return true;
    }
    return false;
  },

  // History operations
  getCustomerHistory(mrNumber: string) {
    return this.history.filter(h => h.customerMr === mrNumber);
  },

  addHistoryEntry(entry: Omit<CustomerHistory, 'id' | 'date'>) {
    const newEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 9),
      date: new Date()
    };
    this.history.push(newEntry);
    return newEntry;
  },

  // Visit logging
  logVisit(mrNumber: string, note?: string) {
    const customer = this.getCustomer(mrNumber);
    if (customer) {
      return this.addHistoryEntry({
        customerMr: mrNumber,
        type: 'visit',
        amount: 0,
        description: note || 'Visit logged',
      });
    }
    return null;
  },

  getVisitHistory(mrNumber: string) {
    return this.getCustomerHistory(mrNumber).filter(h => h.type === 'visit');
  }
}.init();
