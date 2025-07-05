import { getBackendBaseUrl } from './returnsStorage';

export interface POSMedicine {
  id: string;
  name: string;
  salePrice: number;
  stock: number;
  barcode?: string;
}

export const fetchPOSMedicines = async (): Promise<POSMedicine[]> => {
  try {
    const response = await fetch(`${getBackendBaseUrl()}/inventory/pos`);
    if (!response.ok) throw new Error('Failed to fetch POS medicines');
    return response.json();
  } catch (error) {
    console.error('Error fetching POS medicines:', error);
    throw error;
  }
};
