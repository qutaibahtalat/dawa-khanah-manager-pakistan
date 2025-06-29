import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Barcode
} from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { InventoryItem, getInventory, saveInventory, updateItemStock, getLowStockItems } from '@/utils/inventoryService';

interface InventoryControlProps {
  isUrdu: boolean;
}

const InventoryControl: React.FC<InventoryControlProps> = ({ isUrdu }) => {
  const { toast } = useToast();
  // Initialize all state at the top
  const [searchTerm, setSearchTerm] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: '',
    stock: '0',
    minStock: '0',
    maxStock: '0',
    purchasePrice: '0',
    price: '0',
    onePiecePrice: '0',
    totalStockPrice: '0',
    barcode: '',
    manufacturer: '',
    expiryDate: '',
    manufacturingDate: ''
  });
  const [showBarcodeScannerInForm, setShowBarcodeScannerInForm] = useState(false);
  
  // Load inventory on component mount
  useEffect(() => {
    setInventory(getInventory());
  }, []);
  
  // Update total price when one piece price or stock changes
  useEffect(() => {
    const stock = Number(formData.stock) || 0;
    const onePiecePrice = Number(formData.onePiecePrice) || 0;
    const totalPrice = (stock * onePiecePrice).toFixed(2);
    
    // Only update if the calculated value is different to prevent infinite loop
    if (formData.totalStockPrice !== totalPrice || formData.price !== onePiecePrice.toString()) {
      setFormData(prev => ({
        ...prev,
        totalStockPrice: totalPrice,
        price: onePiecePrice.toString()
      }));
    }
  }, [formData.stock, formData.onePiecePrice]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For regular input changes, just update the value
    if (name !== 'onePiecePrice' && name !== 'totalStockPrice') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      return;
    }
    
    // Special handling for price-related fields
    if (name === 'onePiecePrice') {
      const stock = Number(formData.stock) || 0;
      const totalPrice = (Number(value) * stock).toFixed(2);
      
      setFormData(prev => ({
        ...prev,
        onePiecePrice: value,
        price: value,
        totalStockPrice: totalPrice
      }));
    } else if (name === 'totalStockPrice') {
      const stock = Number(formData.stock) || 1; // Avoid division by zero
      const onePiecePrice = (Number(value) / stock).toFixed(2);
      
      setFormData(prev => ({
        ...prev,
        totalStockPrice: value,
        onePiecePrice: onePiecePrice,
        price: onePiecePrice
      }));
    }
  };
  
  const handleSaveInventory = (items: InventoryItem[]) => {
    saveInventory(items);
    setInventory([...items]); // Update local state
    setIsAddDialogOpen(false); // Close the dialog after saving
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: InventoryItem = {
      id: Date.now(),
      name: formData.name,
      genericName: formData.genericName,
      category: formData.category,
      stock: Number(formData.stock) || 0,
      minStock: Number(formData.minStock) || 0,
      maxStock: Number(formData.maxStock) || 0,
      purchasePrice: Number(formData.purchasePrice) || 0,
      price: Number(formData.onePiecePrice) || 0, // Use onePiecePrice for the price
      barcode: formData.barcode,
      manufacturer: formData.manufacturer,
      expiryDate: formData.expiryDate,
      manufacturingDate: formData.manufacturingDate
    };

    const updatedInventory = [...inventory, newItem];
    handleSaveInventory(updatedInventory);
    
    // Reset form
    setFormData({
      name: '',
      genericName: '',
      category: '',
      stock: '0',
      minStock: '0',
      maxStock: '0',
      purchasePrice: '0',
      price: '0',
      onePiecePrice: '0',
      totalStockPrice: '0',
      barcode: '',
      manufacturer: '',
      expiryDate: '',
      manufacturingDate: ''
    });
    
    setIsAddDialogOpen(false);
  };

  const handleBarcodeScanned = (barcode: string) => {
    setSearchTerm(barcode);
    setShowBarcodeScanner(false);
    
    // If we find a matching product, select it
    const matchingItem = inventory.find(item => 
      item.barcode?.toLowerCase() === barcode.toLowerCase()
    );
    
    if (matchingItem) {
      // You might want to handle the matching item (e.g., select it in the UI)
      console.log('Found matching item:', matchingItem);
      
      // Show a toast notification
      toast({
        title: isUrdu ? 'مصنوعات ملی' : 'Product Found',
        description: isUrdu 
          ? `${matchingItem.name} - ${matchingItem.stock || 0} دستیاب`
          : `${matchingItem.name} - ${matchingItem.stock || 0} in stock`,
        variant: 'default' as const
      });
    } else {
      // If no matching item found, offer to add it
      if (confirm(isUrdu 
        ? 'کوئی مماثل مصنوعات نہیں ملی۔ کیا آپ اسے نئی مصنوعات کے طور پر شامل کرنا چاہیں گے؟' 
        : 'No matching product found. Would you like to add it as a new item?')) {
        setFormData(prev => ({
          ...prev,
          barcode: barcode,
          name: '',
          stock: '0',
          price: '0',
          purchasePrice: '0',
          minStock: '0',
          maxStock: '0'
        }));
        setIsAddDialogOpen(true);
      }
    }
  };

  const categories = [
    'Tablets',
    'Syrups',
    'Capsules',
    'Injections',
    'Ointments',
    'Drops',
    'Inhalers',
    'Suppositories',
    'Analgesic',
    'Antibiotic',
    'Antacid',
    'Antihistamine',
    'Antidepressant',
    'Antidiabetic',
    'Antihypertensive',
    'Antiviral',
    'Antiseptic',
    'Antipyretic',
    'Other'
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
  const inventoryValue = inventory.reduce((sum, item) => sum + ((item.price || 0) * (item.stock || 0)), 0);
  const lowStockCount = inventory.filter(item => (item.stock || 0) > 0 && (item.stock || 0) <= (item.minStock || 0)).length;
  const expiringCount = inventory.filter(item => isExpiringSoon(item.expiryDate)).length;
  const outOfStockCount = inventory.filter(item => item.stock === 0).length;

  const filterInventory = () => {
    const filteredItems = inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                          (item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                          (item.barcode?.includes(searchTerm) ?? false);
      
      if (activeTab === 'low') return matchesSearch && item.stock <= (item.minStock || 5);
      if (activeTab === 'expiring') return matchesSearch && isExpiringSoon(item.expiryDate || '');
      if (activeTab === 'out') return matchesSearch && item.stock === 0;
      
      return matchesSearch;
    });
    return filteredItems;
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="flex justify-between items-center">
                      <Label htmlFor="barcode">{isUrdu ? 'بار کوڈ' : 'Barcode'}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBarcodeScannerInForm(!showBarcodeScannerInForm)}
                        className="text-xs h-6 px-2"
                      >
                        {showBarcodeScannerInForm 
                          ? (isUrdu ? 'داخلہ کریں' : 'Enter Manually')
                          : (isUrdu ? 'اسکین کریں' : 'Scan Barcode')}
                      </Button>
                    </div>
                    {showBarcodeScannerInForm ? (
                      <div className="mt-2">
                        <BarcodeScanner 
                          onScan={(barcode) => {
                            setFormData(prev => ({ ...prev, barcode }));
                            setShowBarcodeScannerInForm(false);
                          }}
                          isUrdu={isUrdu}
                        />
                      </div>
                    ) : (
                      <Input
                        id="barcode"
                        name="barcode"
                        value={formData.barcode}
                        onChange={handleInputChange}
                        placeholder={isUrdu ? 'بار کوڈ درج کریں' : 'Enter barcode'}
                      />
                    )}
                  </div>
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
                      onChange={handleInputChange}
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
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                // Get the button element to update its state
                const exportButton = document.querySelector('button:has(> svg.download-icon)') as HTMLButtonElement;
                if (exportButton) {
                  exportButton.disabled = true;
                  const originalContent = exportButton.innerHTML;
                  exportButton.innerHTML = isUrdu 
                    ? '<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> برآمد ہو رہا ہے...'
                    : '<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Exporting...';
                
                  // Get the current date for the filename
                  const today = new Date().toISOString().split('T')[0];
                  
                  // Define CSV headers with proper encoding
                  const headers = [
                    'ID', 'Medicine Name', 'Generic Name', 'Category', 'Manufacturer',
                    'Stock', 'Min Stock', 'Max Stock', 'Unit Price', 'Total Value',
                    'Barcode', 'Manufacturing Date', 'Expiry Date', 'Status', 'Expiry Status'
                  ];

                  // Format data for CSV
                  const rows = filteredInventory.map(item => {
                    const stockStatus = getStockStatus(item.stock, item.minStock);
                    const isExpiring = isExpiringSoon(item.expiryDate);
                    const expiryStatus = isExpiring ? 'Expiring Soon' : 
                                      (new Date(item.expiryDate) < new Date() ? 'Expired' : 'Valid');
                    
                    return {
                      id: item.id,
                      name: `"${(item.name || '').replace(/"/g, '""')}"`,
                      genericName: `"${(item.genericName || '').replace(/"/g, '""')}"`,
                      category: `"${(item.category || '').replace(/"/g, '""')}"`,
                      manufacturer: `"${(item.manufacturer || '').replace(/"/g, '""')}"`,
                      stock: item.stock || 0,
                      minStock: item.minStock || 0,
                      maxStock: item.maxStock || 0,
                      unitPrice: item.price || 0,
                      totalValue: (item.price || 0) * (item.stock || 0),
                      barcode: `"${(item.barcode || '').replace(/"/g, '""')}"`,
                      manufacturingDate: item.manufacturingDate || '',
                      expiryDate: item.expiryDate || '',
                      status: `"${stockStatus.status}"`,
                      expiryStatus: `"${expiryStatus}"`
                    };
                  });

                  // Create CSV content with BOM for Excel
                  const csvContent = [
                    '\uFEFF' + headers.join(','),
                    ...rows.map(row => [
                      row.id,
                      row.name,
                      row.genericName,
                      row.category,
                      row.manufacturer,
                      row.stock,
                      row.minStock,
                      row.maxStock,
                      row.unitPrice.toFixed(2),
                      row.totalValue.toFixed(2),
                      row.barcode,
                      row.manufacturingDate,
                      row.expiryDate,
                      row.status,
                      row.expiryStatus
                    ].join(','))
                  ].join('\r\n');

                  // Create and trigger download
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.setAttribute('href', url);
                  link.setAttribute('download', `inventory_export_${today}.csv`);
                  link.style.visibility = 'hidden';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  
                  // Clean up
                  setTimeout(() => URL.revokeObjectURL(url), 100);

                  // Show success message
                  toast({
                    title: isUrdu ? 'برآمدگی کامیاب' : 'Export Successful',
                    description: isUrdu 
                      ? `انوینٹری کی ${rows.length} اشیاء کامیابی سے برآمد ہو گئی ہیں` 
                      : `Successfully exported ${rows.length} items`,
                    duration: 3000
                  });

                  // Reset button state
                  if (exportButton) {
                    setTimeout(() => {
                      if (exportButton) {
                        exportButton.disabled = false;
                        exportButton.innerHTML = originalContent;
                      }
                    }, 500);
                  }
                }
              } catch (error) {
                console.error('Export failed:', error);
                toast({
                  title: isUrdu ? 'برآمدگی میں خرابی' : 'Export Failed',
                  description: isUrdu 
                    ? 'انوینٹری ڈیٹا برآمد کرتے وقت خرابی آئی ہے' 
                    : 'Failed to export inventory data',
                  variant: 'destructive',
                  duration: 3000
                });
                
                // Reset button state on error
                const exportButton = document.querySelector<HTMLButtonElement>('button:has(> svg.download-icon)');
                if (exportButton) {
                  exportButton.disabled = false;
                  exportButton.innerHTML = isUrdu 
                    ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download h-4 w-4 mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>برآمد کریں'
                    : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download h-4 w-4 mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>Export';
                }
              }
            }}
          >
            <Download className="h-4 w-4 mr-2 download-icon" />
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
        <div className="relative flex items-center w-full">
          <Input
            placeholder={isUrdu ? 'ادویات تلاش کریں یا بار کوڈ اسکین کریں...' : 'Search medicines or scan barcode...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 h-8 w-8"
            onClick={() => setShowBarcodeScanner(!showBarcodeScanner)}
            title={isUrdu ? 'بار کوڈ اسکین کریں' : 'Scan Barcode'}
          >
            <Barcode className="h-4 w-4" />
          </Button>
        </div>
        {showBarcodeScanner && (
          <div className="mt-2 p-3 border rounded-md bg-muted/20">
            <BarcodeScanner 
              onScan={handleBarcodeScanned} 
              isUrdu={isUrdu} 
            />
          </div>
        )}
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          {t.filter}
        </Button>
      </div>

      {/* Inventory Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {[
            { id: 'all', label: t.all },
            { id: 'lowStock', label: t.lowStock },
            { id: 'expiring', label: t.expiring },
            { id: 'outOfStock', label: t.outOfStock }
          ].map(tab => (
            <TabsTrigger 
              key={`tab-${tab.id}`} 
              value={tab.id}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {filteredInventory.map((item, index) => {
              const stockStatus = getStockStatus(item.stock, item.minStock);
              const isExpiring = isExpiringSoon(item.expiryDate);
              
              return (
                <Card key={item.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center" key={`item-grid-${index}`}>
                      <div className="md:col-span-2">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-lg font-bold">{item.stock}</p>
                        <p className="text-xs text-gray-500">Min: {item.minStock}</p>
                        <p className="text-sm text-green-600">PKR {item.price?.toFixed(2) || '0.00'}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">
                          {item.manufacturingDate ? new Date(item.manufacturingDate).toLocaleDateString() : 'N/A'}
                        </p>
                        <div>
                          <p className={`text-sm ${isExpiring ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
                            {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                          </p>
                          {isExpiring && (
                            <Badge 
                              key={`expiring-badge-${item.id}`} 
                              variant="secondary"
                            >
                              Expiring
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="font-semibold">PKR {item.price ? (item.price * item.stock).toFixed(2) : '0.00'}</p>
                        <p className="text-xs text-gray-500">Total: {item.stock} × PKR {item.price?.toFixed(2) || '0.00'}</p>
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
