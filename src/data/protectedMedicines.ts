import { Medicine } from '@/types/medicine';

const protectedMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Panadol',
    genericName: 'Paracetamol',
    manufacturer: 'GSK Pakistan',
    category: 'Analgesic',
    barcode: '123456789012',
    price: 50,
    stock: 100,
    minStock: 10,
    maxStock: 500,
    expiryDate: new Date('2025-12-31'),
    batchNumber: 'PAN2023'
  },
  {
    id: '2',
    name: 'Brufen',
    genericName: 'Ibuprofen',
    manufacturer: 'Abbott Laboratories Pakistan',
    category: 'NSAID',
    barcode: '987654321098',
    price: 80,
    stock: 75,
    minStock: 15,
    maxStock: 300,
    expiryDate: new Date('2024-11-30'),
    batchNumber: 'BRF2023'
  }
];

export default protectedMedicines;
