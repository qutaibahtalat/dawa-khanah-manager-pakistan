export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  category: string;
  barcode: string;
  price: number;
  stock: number;
  minStock?: number;
  maxStock?: number;
  purchasePrice?: number;
  expiryDate: Date;
  manufacturingDate?: Date;
  batchNumber?: string;
}
