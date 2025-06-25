
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
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

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  maxStock: number;
  purchasePrice: number;
  salePrice: number;
  expiryDate: string;
  value: number;
  manufacturingDate: string;
  totalStockPrice: number;
  onePiecePrice: number;
}

const STORAGE_KEY = 'inventoryItems';

const InventoryControl: React.FC<InventoryControlProps> = ({ isUrdu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    // Load inventory from localStorage on initial render
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: '',
    minStock: '',
    maxStock: '',
    purchasePrice: '',
    salePrice: '',
    expiryDate: '',
    manufacturingDate: '',
    totalStockPrice: '',
    onePiecePrice: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveInventory = (items: InventoryItem[]) => {
    setInventory(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: InventoryItem = {
      id: Date.now(),
      name: formData.name,
      category: formData.category,
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
      maxStock: Number(formData.maxStock) || 0,
      purchasePrice: Number(formData.purchasePrice) || 0,
      salePrice: Number(formData.salePrice) || 0,
      expiryDate: formData.expiryDate,
      manufacturingDate: formData.manufacturingDate,
      value: Number(formData.totalStockPrice) || 0,
      totalStockPrice: Number(formData.totalStockPrice) || 0,
      onePiecePrice: Number(formData.onePiecePrice) || 0
    };

    const updatedInventory = [...inventory, newItem];
    saveInventory(updatedInventory);
    
    // Reset form
    setFormData({
      name: '',
      category: '',
      stock: '',
      minStock: '',
      maxStock: '',
      purchasePrice: '',
      salePrice: '',
      expiryDate: '',
      manufacturingDate: '',
      totalStockPrice: '',
      onePiecePrice: ''
    });
    
    setIsAddDialogOpen(false);
  };

  const categories = [
    'Analgesic',
    'Antibiotic',
    'Antacid',
    'Antihistamine',
    'Antidepressant',
    'Antidiabetic',
    'Antihypertensive',
    'Antiviral',
    'Antiseptic',
    'Antipyretic'
  ];

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

  // Helper functions
  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 days
    return expiry <= threeDaysFromNow;
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { status: 'Out of Stock', color: 'destructive', icon: AlertTriangle };
    if (stock <= minStock) return { status: 'Low Stock', color: 'secondary', icon: TrendingDown };
    return { status: 'In Stock', color: 'default', icon: Package };
  };

  // Calculate inventory metrics
  const inventoryValue = inventory.reduce((sum, item) => sum + (item.value || 0), 0);
  const lowStockCount = inventory.filter(item => item.stock > 0 && item.stock <= item.minStock).length;
  const expiringCount = inventory.filter(item => isExpiringSoon(item.expiryDate)).length;
  const outOfStockCount = inventory.filter(item => item.stock === 0).length;

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <div className="flex space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Package className="mr-2 h-4 w-4" />
                {isUrdu ? 'انوینٹری شامل کریں' : 'Add Inventory'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isUrdu ? 'نیا انوینٹری آئٹم شامل کریں' : 'Add New Inventory Item'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{isUrdu ? 'دوا کا نام' : 'Medicine Name'}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={isUrdu ? 'دوا کا نام درج کریں' : 'Enter medicine name'}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">{isUrdu ? 'قسم' : 'Category'}</Label>
                  <Select
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    value={formData.category}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isUrdu ? 'قسم منتخب کریں' : 'Select category'} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">{isUrdu ? 'کل اسٹاک' : 'Total Stock'}</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="1"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStock">{isUrdu ? 'کم از کم اسٹاک' : 'Minimum Stock'}</Label>
                    <Input
                      id="minStock"
                      name="minStock"
                      type="number"
                      min="0"
                      value={formData.minStock}
                      onChange={handleInputChange}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manufacturingDate">
                      {isUrdu ? 'تیاری کی تاریخ' : 'Manufacturing Date'}
                    </Label>
                    <Input
                      id="manufacturingDate"
                      name="manufacturingDate"
                      type="date"
                      value={formData.manufacturingDate}
                      onChange={handleInputChange}
                      max={format(new Date(), 'yyyy-MM-dd')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">
                      {isUrdu ? 'ختم ہونے کی تاریخ' : 'Expiry Date'}
                    </Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      type="date"
                      min={formData.manufacturingDate || format(new Date(), 'yyyy-MM-dd')}
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="onePiecePrice">
                      {isUrdu ? 'ایک ٹکڑے کی قیمت' : 'One Piece Price'}
                    </Label>
                    <Input
                      id="onePiecePrice"
                      name="onePiecePrice"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.onePiecePrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalStockPrice">
                      {isUrdu ? 'کل اسٹاک قیمت' : 'Total Stock Price'}
                    </Label>
                    <Input
                      id="totalStockPrice"
                      name="totalStockPrice"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.totalStockPrice}
                      onChange={(e) => {
                        const totalPrice = e.target.value;
                        const onePiece = formData.stock ? (Number(totalPrice) / Number(formData.stock)).toFixed(2) : '0';
                        setFormData(prev => ({
                          ...prev,
                          totalStockPrice: totalPrice,
                          onePiecePrice: onePiece
                        }));
                      }}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                  </Button>
                  <Button type="submit">
                    {isUrdu ? 'محفوظ کریں' : 'Save'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                <p className="text-2xl font-bold text-green-600">PKR {inventoryValue.toLocaleString()}</p>
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
                        <p className="text-sm text-green-600">PKR {item.onePiecePrice?.toFixed(2) || '0.00'}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">
                          {new Date(item.manufacturingDate).toLocaleDateString()}
                        </p>
                        <p className={`text-sm ${isExpiring ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
                          {new Date(item.expiryDate).toLocaleDateString()}
                        </p>
                        {isExpiring && <Badge variant="secondary">Expiring</Badge>}
                      </div>
                      
                      <div className="text-center">
                        <p className="font-semibold">PKR {item.totalStockPrice?.toFixed(2) || '0.00'}</p>
                        <p className="text-xs text-gray-500">Total: {item.stock} × PKR {item.onePiecePrice?.toFixed(2) || '0.00'}</p>
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
