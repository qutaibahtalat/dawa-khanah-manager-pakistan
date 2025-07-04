import { Supplier, SupplierOrder, SupplierPayment } from '@/types/supplier';

export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Pharma Distributors Inc.',
    contactPerson: 'John Smith',
    phone: '+923001234567',
    email: 'john@pharmadist.com',
    address: '123 Pharma Street, Karachi',
    taxId: '123456789',
    paymentTerms: 'Net 30 days',
    creditLimit: 500000,
    currentBalance: 125000,
    notes: 'Primary supplier for antibiotics',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
    orders: [
      {
        id: 'order1',
        supplierId: '1',
        medicineId: 'med123',
        medicineName: 'Amoxicillin 500mg',
        batchNumber: 'BATCH2023-01',
        quantity: 100,
        unitPrice: 150,
        totalCost: 15000,
        expectedDelivery: new Date('2023-06-15'),
        actualDelivery: new Date('2023-06-15'),
        receivedQuantity: 100,
        status: 'delivered',
        createdAt: new Date('2023-05-20'),
        updatedAt: new Date('2023-06-15')
      },
      {
        id: 'order2',
        supplierId: '1',
        medicineId: 'med456',
        medicineName: 'Paracetamol 500mg',
        batchNumber: 'BATCH2023-02',
        quantity: 200,
        unitPrice: 50,
        totalCost: 10000,
        expectedDelivery: new Date('2023-07-01'),
        status: 'pending',
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date('2023-06-01')
      }
    ],
    payments: [
      {
        id: 'payment1',
        supplierId: '1',
        orderId: 'order1',
        amount: 15000,
        date: new Date('2023-06-20'),
        method: 'bank_transfer',
        reference: 'TRANS12345',
        status: 'completed',
        createdAt: new Date('2023-06-20')
      },
      {
        id: 'payment2',
        supplierId: '1',
        orderId: 'order1',
        amount: 5000,
        date: new Date('2023-07-01'),
        method: 'cheque',
        reference: 'CHQ7890',
        status: 'pending',
        createdAt: new Date('2023-07-01')
      }
    ]
  },
  {
    id: '2',
    name: 'MediCare Suppliers',
    contactPerson: 'Sarah Khan',
    phone: '+923004567890',
    email: 'sarah@medicare.com',
    address: '456 Health Avenue, Lahore',
    taxId: '987654321',
    paymentTerms: 'Net 15 days',
    creditLimit: 300000,
    currentBalance: 75000,
    notes: 'Specializes in cardiac medicines',
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-05-20'),
    orders: [
      {
        id: 'order3',
        supplierId: '2',
        medicineId: 'med789',
        medicineName: 'Atorvastatin 20mg',
        batchNumber: 'BATCH2023-03',
        quantity: 150,
        unitPrice: 200,
        totalCost: 30000,
        expectedDelivery: new Date('2023-06-30'),
        status: 'partially_delivered',
        receivedQuantity: 100,
        createdAt: new Date('2023-06-10'),
        updatedAt: new Date('2023-06-25')
      }
    ],
    payments: [
      {
        id: 'payment3',
        supplierId: '2',
        orderId: 'order3',
        amount: 20000,
        date: new Date('2023-06-15'),
        method: 'cash',
        status: 'completed',
        createdAt: new Date('2023-06-15')
      }
    ]
  },
  {
    id: '3',
    name: 'Global Pharma Solutions',
    contactPerson: 'Ahmed Malik',
    phone: '+923211234567',
    email: 'ahmed@globalpharma.com',
    address: '789 Health Avenue, Islamabad',
    paymentTerms: 'Cash on delivery',
    notes: 'Specializes in surgical supplies',
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-03-10'),
    orders: [],
    payments: []
  }
];

export const mockSupplierOrders: SupplierOrder[] = [];

export const mockSupplierPayments: SupplierPayment[] = [];
