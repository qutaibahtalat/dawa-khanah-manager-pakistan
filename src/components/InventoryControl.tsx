
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface InventoryControlProps {
  isUrdu: boolean;
}

const InventoryControl: React.FC<InventoryControlProps> = ({ isUrdu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const text = {
    en: {
      title: 'Inventory Control',
      searchPlaceholder: 'Search inventory...',
      all: 'All Items',
      lowStock: 'Low Stock',
      expiring: 'Expiring Soon',
      outOfStock: 'Out of Stock',
      stockValue: 'Total Stock Value',
      lowStockItems: 'Low Stock Items',
      expiringItems: 'Expiring Soon',
      outOfStockItems: 'Out of Stock',
      refresh: 'Refresh',
      export: 'Export',
      filter: 'Filter',
      medicine: 'Medicine',
      category: 'Category',
      stock: 'Stock',
      expiry: 'Expiry',
      value: 'Value',
      status: 'Status'
    },
    ur: {
      title: 'انوینٹری کنٹرول',
      searchPlaceholder: 'انوینٹری تلاش کریں...',
      all: 'تمام اشیاء',
      lowStock: 'کم اسٹاک',
      expiring: 'ختم ہونے والی',
      outOfStock: 'اسٹاک ختم',
      stockValue: 'کل اسٹاک کی قیمت',
      lowStockItems: 'کم اسٹاک کی اشیاء',
      expiringItems: 'ختم ہونے والی اشیاء',
      outOfStockItems: 'ختم شدہ اشیاء',
      refresh: 'تازہ کریں',
      export: 'ایکسپورٹ',
      filter: 'فلٹر',
      medicine: 'دوا',
      category: 'قسم',
      stock: 'اسٹاک',
      expiry: 'ختم ہونے کی تاریخ',
      value: 'قیمت',
      status: 'حالت'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Sample inventory data
  const inventory = [
    {
      id: 1,
      name: 'Panadol Extra',
      category: 'Analgesic',
      stock: 150,
      minStock: 50,
      maxStock: 500,
      purchasePrice: 25.00,
      salePrice: 35.00,
      expiryDate: '2026-12-31',
      value: 150 * 25.00
    },
    {
      id: 2,
      name: 'Augmentin 625mg',
      category: 'Antibiotic',
      stock: 15,
      minStock: 20,
      maxStock: 100,
      purchasePrice: 350.00,
      salePrice: 450.00,
      expiryDate: '2025-06-30',
      value: 15 * 350.00
    },
    {
      id: 3,
      name: 'Brufen 400mg',
      category: 'Analgesic',
      stock: 0,
      minStock: 25,
      maxStock: 200,
      purchasePrice: 45.00,
      salePrice: 60.00,
      expiryDate: '2027-03-15',
      value: 0
    },
    {
      id: 4,
      name: 'Vitamin C Tablets',
      category: 'Vitamin',
      stock: 50,
      minStock: 30,
      maxStock: 300,
      purchasePrice: 15.00,
      salePrice: 25.00,
      expiryDate: '2025-01-15',
      value: 50 * 15.00
    }
  ];

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { status: 'Out of Stock', color: 'destructive', icon: AlertTriangle };
    if (stock <= minStock) return { status: 'Low Stock', color: 'secondary', icon: TrendingDown };
    return { status: 'In Stock', color: 'default', icon: Package };
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 days
    return expiry <= threeDaysFromNow;
  };

  const filterInventory = () => {
    let filtered = inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (activeTab) {
      case 'lowStock':
        return filtered.filter(item => item.stock > 0 && item.stock <= item.minStock);
      case 'expiring':
        return filtered.filter(item => isExpiringSoon(item.expiryDate));
      case 'outOfStock':
        return filtered.filter(item => item.stock === 0);
      default:
        return filtered;
    }
  };

  const filteredInventory = filterInventory();
  const totalValue = inventory.reduce((sum, item) => sum + item.value, 0);
  const lowStockCount = inventory.filter(item => item.stock > 0 && item.stock <= item.minStock).length;
  const expiringCount = inventory.filter(item => isExpiringSoon(item.expiryDate)).length;
  const outOfStockCount = inventory.filter(item => item.stock === 0).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t.refresh}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t.export}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.stockValue}</p>
                <p className="text-2xl font-bold text-green-600">PKR {totalValue.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.lowStockItems}</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.expiringItems}</p>
                <p className="text-2xl font-bold text-orange-600">{expiringCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.outOfStockItems}</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          {t.filter}
        </Button>
      </div>

      {/* Inventory Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">{t.all}</TabsTrigger>
          <TabsTrigger value="lowStock">{t.lowStock}</TabsTrigger>
          <TabsTrigger value="expiring">{t.expiring}</TabsTrigger>
          <TabsTrigger value="outOfStock">{t.outOfStock}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {filteredInventory.map((item) => {
              const stockStatus = getStockStatus(item.stock, item.minStock);
              const isExpiring = isExpiringSoon(item.expiryDate);
              
              return (
                <Card key={item.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <div className="md:col-span-2">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-lg font-bold">{item.stock}</p>
                        <p className="text-xs text-gray-500">Min: {item.minStock}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className={`text-sm ${isExpiring ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
                          {item.expiryDate}
                        </p>
                        {isExpiring && <Badge variant="secondary">Expiring</Badge>}
                      </div>
                      
                      <div className="text-center">
                        <p className="font-semibold">PKR {item.value.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Sale: PKR {item.salePrice}</p>
                      </div>
                      
                      <div className="text-center">
                        <Badge variant={stockStatus.color as any}>
                          {stockStatus.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryControl;
