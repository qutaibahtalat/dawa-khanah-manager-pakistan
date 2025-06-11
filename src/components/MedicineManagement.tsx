
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  Barcode,
  Calendar,
  DollarSign
} from 'lucide-react';

interface MedicineManagementProps {
  isUrdu: boolean;
}

const MedicineManagement: React.FC<MedicineManagementProps> = ({ isUrdu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const text = {
    en: {
      title: 'Medicine Management',
      searchPlaceholder: 'Search medicines...',
      addNew: 'Add New Medicine',
      medicineName: 'Medicine Name',
      genericName: 'Generic Name',
      category: 'Category',
      manufacturer: 'Manufacturer',
      batchNo: 'Batch No.',
      expiryDate: 'Expiry Date',
      purchasePrice: 'Purchase Price',
      salePrice: 'Sale Price',
      quantity: 'Quantity',
      barcode: 'Barcode',
      save: 'Save Medicine',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      inStock: 'In Stock',
      lowStock: 'Low Stock',
      outOfStock: 'Out of Stock'
    },
    ur: {
      title: 'ادویات کا انتظام',
      searchPlaceholder: 'ادویات تلاش کریں...',
      addNew: 'نئی دوا شامل کریں',
      medicineName: 'دوا کا نام',
      genericName: 'عام نام',
      category: 'قسم',
      manufacturer: 'بنانے والا',
      batchNo: 'بیچ نمبر',
      expiryDate: 'ختم ہونے کی تاریخ',
      purchasePrice: 'خرید کی قیمت',
      salePrice: 'فروخت کی قیمت',
      quantity: 'مقدار',
      barcode: 'بار کوڈ',
      save: 'دوا محفوظ کریں',
      cancel: 'منسوخ',
      edit: 'تبدیل کریں',
      delete: 'حذف کریں',
      inStock: 'اسٹاک میں',
      lowStock: 'کم اسٹاک',
      outOfStock: 'اسٹاک ختم'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Sample medicine data
  const medicines = [
    {
      id: 1,
      name: 'Panadol Extra',
      genericName: 'Paracetamol',
      category: 'Analgesic',
      manufacturer: 'GSK',
      batchNo: 'B123456',
      expiryDate: '2026-12-31',
      purchasePrice: 25.00,
      salePrice: 35.00,
      quantity: 150,
      barcode: '123456789012'
    },
    {
      id: 2,
      name: 'Augmentin 625mg',
      genericName: 'Amoxicillin',
      category: 'Antibiotic',
      manufacturer: 'GSK',
      batchNo: 'B789012',
      expiryDate: '2025-06-30',
      purchasePrice: 350.00,
      salePrice: 450.00,
      quantity: 45,
      barcode: '123456789013'
    },
    {
      id: 3,
      name: 'Brufen 400mg',
      genericName: 'Ibuprofen',
      category: 'Analgesic',
      manufacturer: 'Abbott',
      batchNo: 'B345678',
      expiryDate: '2027-03-15',
      purchasePrice: 45.00,
      salePrice: 60.00,
      quantity: 8,
      barcode: '123456789014'
    }
  ];

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: t.outOfStock, color: 'destructive' };
    if (quantity < 20) return { status: t.lowStock, color: 'secondary' };
    return { status: t.inStock, color: 'default' };
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.barcode.includes(searchTerm)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>{t.addNew}</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add Medicine Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{t.addNew}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medicineName">{t.medicineName}</Label>
                <Input id="medicineName" placeholder={t.medicineName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genericName">{t.genericName}</Label>
                <Input id="genericName" placeholder={t.genericName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t.category}</Label>
                <Input id="category" placeholder={t.category} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer">{t.manufacturer}</Label>
                <Input id="manufacturer" placeholder={t.manufacturer} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batchNo">{t.batchNo}</Label>
                <Input id="batchNo" placeholder={t.batchNo} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">{t.expiryDate}</Label>
                <Input id="expiryDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">{t.purchasePrice}</Label>
                <Input id="purchasePrice" type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">{t.salePrice}</Label>
                <Input id="salePrice" type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">{t.quantity}</Label>
                <Input id="quantity" type="number" placeholder="0" />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                {t.cancel}
              </Button>
              <Button onClick={() => setShowAddForm(false)}>
                {t.save}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medicine List */}
      <div className="grid gap-4">
        {filteredMedicines.map((medicine) => {
          const stockStatus = getStockStatus(medicine.quantity);
          
          return (
            <Card key={medicine.id} className="transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{medicine.name}</h3>
                      <p className="text-sm text-gray-600">{medicine.genericName}</p>
                      <Badge variant="outline" className="mt-1">{medicine.category}</Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span>{medicine.manufacturer}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Barcode className="h-4 w-4 text-gray-400" />
                        <span>{medicine.barcode}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{medicine.expiryDate}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span>Batch: {medicine.batchNo}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>PKR {medicine.salePrice}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Stock: {medicine.quantity}</span>
                        <Badge variant={stockStatus.color as any}>{stockStatus.status}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MedicineManagement;
