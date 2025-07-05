export interface ReturnItem {
  id: number;
  customerName: string;
  companyName: string;
  medicineName: string;
  price: string;
  date: string;
}

export interface SupplierReturnItem {
  id: number;
  companyName: string;
  supplierName: string;
  totalStockPrice: number;
  totalStockQuantity: number;
  date: string;
}

export function getBackendBaseUrl() {
  // @ts-ignore
  if (window?.electronAPI?.getBackendBaseUrl) {
    // @ts-ignore
    return window.electronAPI.getBackendBaseUrl();
  }
  return 'http://192.168.100.120:3002/api';
}

export const saveReturn = async (returnItem: Omit<ReturnItem, 'id' | 'date'>): Promise<ReturnItem> => {
  const res = await fetch(`${getBackendBaseUrl()}/returns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...returnItem, date: new Date().toISOString() })
  });
  const result = await res.json();
  return { ...returnItem, id: result.id, date: new Date().toISOString() };
};

export const getReturns = async (): Promise<ReturnItem[]> => {
  const res = await fetch(`${getBackendBaseUrl()}/returns`);
  return res.json();
};

export const deleteReturn = async (id: number): Promise<void> => {
  await fetch(`${getBackendBaseUrl()}/returns/${id}`, { method: 'DELETE' });
};

export const saveSupplierReturn = async (data: Omit<SupplierReturnItem, 'id' | 'date'>): Promise<SupplierReturnItem> => {
  const res = await fetch(`${getBackendBaseUrl()}/supplier-returns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, date: new Date().toISOString() })
  });
  const result = await res.json();
  return { ...data, id: result.id, date: new Date().toISOString() };
};

export const getSupplierReturns = async (): Promise<SupplierReturnItem[]> => {
  const res = await fetch(`${getBackendBaseUrl()}/supplier-returns`);
  return res.json();
};

export const deleteSupplierReturn = async (id: number): Promise<void> => {
  await fetch(`${getBackendBaseUrl()}/supplier-returns/${id}`, { method: 'DELETE' });
};

export const clearReturns = async (): Promise<void> => {
  // No direct backend API for clear all; delete all individually if needed
  const returns = await getReturns();
  await Promise.all(returns.map(r => deleteReturn(r.id)));
  const supplierReturns = await getSupplierReturns();
  await Promise.all(supplierReturns.map(r => deleteSupplierReturn(r.id)));
};
