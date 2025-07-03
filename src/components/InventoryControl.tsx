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
import { DoubleConfirmDialog } from './ui/DoubleConfirmDialog';
import { InventoryItem, getInventory, saveInventory, updateItemStock, getLowStockItems } from '@/utils/inventoryService';

interface InventoryControlProps {
  isUrdu: boolean;
}

const InventoryControl: React.FC<InventoryControlProps> = ({ isUrdu }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
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
    batchNo: '',
    stock: '0',
    minStock: '10',
    maxStock: '100',
    purchasePrice: '0',
    salePrice: '0',
    totalStockPrice: '0',
    barcode: '',
    manufacturer: '',
    supplierName: '',
    expiryDate: '',
    manufacturingDate: '',
    _lastChanged: '', // tracks which field was last edited for auto-calc
  });

  // Supplier state for dropdown and add-new
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [showAddSupplierDialog, setShowAddSupplierDialog] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    taxId: '',
    status: 'active'
  });

  // Load suppliers for dropdown on mount
  useEffect(() => {
    const savedSuppliers = localStorage.getItem('pharmacy_suppliers');
    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers));
    } else {
      setSuppliers([]);
    }
  }, []);
  const [showBarcodeScannerInForm, setShowBarcodeScannerInForm] = useState(false);
  
  // Load inventory on component mount
  useEffect(() => {
    setInventory(getInventory());
  }, []);
  
  // Auto-calculate totalStockPrice or purchasePrice based on user input
  useEffect(() => {
    const stock = Number(formData.stock) || 0;
    const purchasePrice = Number(formData.purchasePrice) || 0;
    // Only auto-calculate if user is editing stock or purchasePrice directly
    if (formData._lastChanged === 'stock' || formData._lastChanged === 'purchasePrice') {
      const totalStockPrice = (stock * purchasePrice).toFixed(2);
      if (formData.totalStockPrice !== totalStockPrice) {
        setFormData(prev => ({
          ...prev,
          totalStockPrice,
        }));
      }
    }
    // If user is editing totalStockPrice directly, update purchasePrice
    if (formData._lastChanged === 'totalStockPrice') {
      if (stock > 0) {
        const calculatedPurchasePrice = (Number(formData.totalStockPrice) / stock).toFixed(2);
        if (formData.purchasePrice !== calculatedPurchasePrice) {
          setFormData(prev => ({
            ...prev,
            purchasePrice: calculatedPurchasePrice,
          }));
        }
      }
    }
  }, [formData.stock, formData.purchasePrice, formData.totalStockPrice, formData._lastChanged]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Handle auto-calculation triggers
    if (name === 'stock' || name === 'purchasePrice') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        _lastChanged: name
      }));
    } else if (name === 'totalStockPrice') {
      setFormData(prev => ({
        ...prev,
        totalStockPrice: value,
        _lastChanged: 'totalStockPrice'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
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
      batchNo: formData.batchNo,
      stock: Number(formData.stock) || 0,
      minStock: Number(formData.minStock) || 10,
      maxStock: Number(formData.maxStock) || 100,
      purchasePrice: Number(formData.purchasePrice) || 0,
      salePrice: Number(formData.salePrice) || 0,
      price: Number(formData.salePrice) || 0, // For compatibility
      barcode: formData.barcode,
      manufacturer: formData.manufacturer,
      supplierName: formData.supplierName,
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
      batchNo: '',
      stock: '0',
      minStock: '10',
      maxStock: '100',
      purchasePrice: '0',
      salePrice: '0',
      totalStockPrice: '0',
      barcode: '',
      manufacturer: '',
      supplierName: '',
      expiryDate: '',
      manufacturingDate: '',
      _lastChanged: '',
    });
    
    setIsAddDialogOpen(false);
  };

  // Add new supplier handler
  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    const newSup = {
      ...newSupplier,
      id: Date.now(),
      supplies: [],
      purchases: [],
      totalPurchases: 0,
      pendingPayments: 0,
      lastOrder: new Date().toISOString().split('T')[0],
    };
    const updatedSuppliers = [...suppliers, newSup];
    setSuppliers(updatedSuppliers);
    localStorage.setItem('pharmacy_suppliers', JSON.stringify(updatedSuppliers));
    setFormData(prev => ({ ...prev, supplierName: newSup.companyName }));
    setShowAddSupplierDialog(false);
    setNewSupplier({
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      taxId: '',
      status: 'active'
    });
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

  // Stub for editing inventory item
  const handleEditItem = (item: InventoryItem) => {
    // TODO: Implement edit logic (open edit dialog, populate form, etc.)
    alert('Edit functionality is not implemented yet.');
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

  // Double confirmation dialog for deletion
  const deleteChecklist = [
    isUrdu ? 'میں تصدیق کرتا ہوں کہ یہ عمل ناقابل واپسی ہے۔' : 'I understand this action cannot be undone.',
    isUrdu ? 'میں نے اس اسٹاک آئٹم کو چیک کر لیا ہے اور مستقل طور پر حذف کرنا چاہتا ہوں۔' : 'I have reviewed the item and wish to permanently delete it.'
  ];

  const handleDeleteInventory = (id: number) => {
    setDeleteTargetId(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteInventory = () => {
    if (deleteTargetId === null) return;
    const updatedInventory = inventory.filter(item => item.id !== deleteTargetId);
    saveInventory(updatedInventory);
    setInventory(updatedInventory);
    // Optionally add audit log here if available
    setShowDeleteDialog(false);
    setDeleteTargetId(null);
    toast({
      title: isUrdu ? 'کامیابی' : 'Success',
      description: isUrdu ? 'اسٹاک آئٹم کامیابی سے حذف ہو گیا' : 'Inventory item deleted successfully',
    });
  };

  const cancelDeleteInventory = () => {
    setShowDeleteDialog(false);
    setDeleteTargetId(null);
  };


  return (
    <React.Fragment>
      <div>
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
              <DialogContent className="max-w-3xl w-full mx-auto">
                <DialogHeader>
                  <DialogTitle>{isUrdu ? 'نیا انوینٹری آئٹم شامل کریں' : 'Add New Inventory Item'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Responsive grid: 2 columns on md, 3 on xl */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{isUrdu ? 'ادویات کا نام' : 'Medicine Name'} <span className="text-red-500">*</span></Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={isUrdu ? 'ادویات کا نام درج کریں' : 'Enter medicine name'}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="genericName">{isUrdu ? 'جنیرک نام' : 'Generic Name'} <span className="text-red-500">*</span></Label>
                      <Input
                        id="genericName"
                        name="genericName"
                        value={formData.genericName}
                        onChange={handleInputChange}
                        placeholder={isUrdu ? 'جنیرک نام درج کریں' : 'Enter generic name'}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">{isUrdu ? 'قسم' : 'Category'} <span className="text-red-500">*</span></Label>
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
                    <div className="space-y-2">
                      <Label htmlFor="batchNo">{isUrdu ? 'بیچ نمبر' : 'Batch No.'} <span className="text-red-500">*</span></Label>
                      <Input
                        id="batchNo"
                        name="batchNo"
                        value={formData.batchNo}
                        onChange={handleInputChange}
                        placeholder={isUrdu ? 'بیچ نمبر درج کریں' : 'Enter batch number'}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplierName">{isUrdu ? 'سپلائر' : 'Supplier'} <span className="text-red-500">*</span></Label>
                      <Select
                        value={formData.supplierName}
                        onValueChange={value => {
                          if (value === 'add_new') {
                            setShowAddSupplierDialog(true);
                          } else {
                            setFormData(prev => ({ ...prev, supplierName: value }));
                          }
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isUrdu ? 'سپلائر منتخب کریں' : 'Select supplier'} />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map(sup => (
                            <SelectItem key={sup.companyName} value={sup.companyName}>
                              {sup.companyName}
                            </SelectItem>
                          ))}
                          <SelectItem value="add_new">
                            {isUrdu ? 'نیا سپلائر شامل کریں' : 'Add New Supplier'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manufacturer">{isUrdu ? 'مینوفیکچرر' : 'Manufacturer'}</Label>
                      <Input
                        id="manufacturer"
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleInputChange}
                        placeholder={isUrdu ? 'مینوفیکچرر درج کریں' : 'Enter manufacturer'}
                      />
                    </div>
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


                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        placeholder="10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxStock">{isUrdu ? 'زیادہ سے زیادہ اسٹاک' : 'Max Stock'}</Label>
                      <Input
                        id="maxStock"
                        name="maxStock"
                        type="number"
                        min="1"
                        value={formData.maxStock}
                        onChange={handleInputChange}
                        placeholder="100"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                        <span className="ml-1 text-xs text-muted-foreground">{isUrdu ? '(فارمیٹ: YYYY-MM-DD)' : '(Format: YYYY-MM-DD)'}</span>
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="purchasePrice">{isUrdu ? 'خریداری قیمت' : 'Purchase Price'} <span className="text-red-500">*</span></Label>
                      <Input
                        id="purchasePrice"
                        name="purchasePrice"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={formData.purchasePrice}
                        onChange={handleInputChange}
                        placeholder={isUrdu ? 'خریداری قیمت' : 'Enter purchase price'}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salePrice">{isUrdu ? 'فروخت قیمت' : 'Sale Price'} <span className="text-red-500">*</span></Label>
                      <Input
                        id="salePrice"
                        name="salePrice"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={formData.salePrice}
                        onChange={handleInputChange}
                        placeholder={isUrdu ? 'فروخت قیمت' : 'Enter sale price'}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalStockPrice">{isUrdu ? 'کل اسٹاک قیمت' : 'Total Stock Price'}</Label>
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
                      <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                        {isUrdu ? 'ترمیم کریں' : 'Edit'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TabsContent>
    </Tabs>
    {/* Add Supplier Dialog */}
    <Dialog open={showAddSupplierDialog} onOpenChange={setShowAddSupplierDialog}>
      <DialogContent className="max-w-lg w-full mx-auto">
        <DialogHeader>
          <DialogTitle>{isUrdu ? 'نیا سپلائر شامل کریں' : 'Add New Supplier'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddSupplier} className="space-y-4">
          <div className="space-y-2">
            <Label>{isUrdu ? 'کمپنی کا نام' : 'Company Name'}</Label>
            <Input
              value={newSupplier.companyName}
              onChange={e => setNewSupplier(prev => ({ ...prev, companyName: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{isUrdu ? 'رابطہ کار' : 'Contact Person'}</Label>
            <Input
              value={newSupplier.contactPerson}
              onChange={e => setNewSupplier(prev => ({ ...prev, contactPerson: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{isUrdu ? 'فون نمبر' : 'Phone Number'}</Label>
            <Input
              value={newSupplier.phone}
              onChange={e => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{isUrdu ? 'ای میل' : 'Email'}</Label>
            <Input
              type="email"
              value={newSupplier.email}
              onChange={e => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>{isUrdu ? 'پتہ' : 'Address'}</Label>
            <Input
              value={newSupplier.address}
              onChange={e => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>{isUrdu ? 'ٹیکس آئی ڈی' : 'Tax ID'}</Label>
            <Input
              value={newSupplier.taxId}
              onChange={e => setNewSupplier(prev => ({ ...prev, taxId: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>{isUrdu ? 'حالت' : 'Status'}</Label>
            <Select value={newSupplier.status} onValueChange={value => setNewSupplier(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{isUrdu ? 'فعال' : 'Active'}</SelectItem>
                <SelectItem value="inactive">{isUrdu ? 'غیر فعال' : 'Inactive'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-2 justify-end">
            <Button type="submit" className="flex-1">
              {isUrdu ? 'محفوظ کریں' : 'Save'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowAddSupplierDialog(false)}>
              {isUrdu ? 'منسوخ کریں' : 'Cancel'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    {/* Double Confirm Dialog for Deletion */}
    <DoubleConfirmDialog
      open={showDeleteDialog}
      title={isUrdu ? 'کیا آپ واقعی یہ اسٹاک آئٹم حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this inventory item?'}
      description={isUrdu ? 'یہ عمل ناقابل واپسی ہے۔ براہ کرم تصدیق کریں کہ آپ اس اسٹاک آئٹم کو مستقل طور پر حذف کرنا چاہتے ہیں۔' : 'This action is irreversible. Please confirm you want to permanently delete this inventory item.'}
      checklist={deleteChecklist}
      confirmLabel={isUrdu ? 'حذف کریں' : 'Delete'}
      cancelLabel={isUrdu ? 'منسوخ' : 'Cancel'}
      onConfirm={confirmDeleteInventory}
      onCancel={cancelDeleteInventory}
    />
  </React.Fragment>
  );
};

export default InventoryControl;
