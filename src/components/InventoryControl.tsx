import React, { useState, useEffect, useMemo } from 'react';
import { getBackendBaseUrl } from '@/utils/returnsStorage';
import { fetchInventory } from '@/utils/inventoryAPI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
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
import BulkInventoryImport from './BulkInventoryImport';
import { useContext } from 'react';
import { InventoryContext } from '@/contexts/InventoryContext';
import { MedicineEditForm } from './MedicineEditForm';
import { ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import API_ENDPOINTS from '../utils/apiConfig';
import { Medicine } from '../types/medicine';
import { medicineServiceBackend } from '../services/medicineService.backend';

// Custom debounce hook implementation
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface InventoryControlProps {
  isUrdu: boolean;
}

interface AddStockDialogProps {
  inventory: InventoryItem[];
  distributors: {companyName: string}[];
  onStockAdded: () => void;
}

const AddStockDialog: React.FC<AddStockDialogProps> = ({ inventory, distributors, onStockAdded }) => {
  const [selectedMedicine, setSelectedMedicine] = useState<InventoryItem | null>(null);
  const [stockQuantity, setStockQuantity] = useState<string>('');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [salePrice, setSalePrice] = useState<string>('');
  const [lastPurchasePrice, setLastPurchasePrice] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [selectedDistributor, setSelectedDistributor] = useState<string>('');
  const [newDistributorName, setNewDistributorName] = useState<string>('');
  const [showNewDistributorField, setShowNewDistributorField] = useState<boolean>(false);
  const { toast } = useToast();

  const handleAddStock = async () => {
    if (!selectedMedicine || !stockQuantity || !unitPrice) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const distributor = showNewDistributorField ? newDistributorName : selectedDistributor;
      
      const updatedItem = {
        ...selectedMedicine,
        stock: (parseInt(selectedMedicine.stock.toString()) + parseInt(stockQuantity)).toString(),
        purchasePrice: unitPrice,
        salePrice: salePrice || selectedMedicine.salePrice,
        lastPurchasePrice: unitPrice,
        lastPurchaseDate: new Date().toISOString(),
        lastDistributor: distributor,
      };

      await updateItemStock(updatedItem);
      onStockAdded();
      
      toast({
        title: 'Success',
        description: 'Stock added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add stock',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="default"
          className="gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ml-2"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Stock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Stock</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Medicine selection */}
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <Label htmlFor="medicine" className="md:text-right">
              Medicine
            </Label>
            <div className="md:col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedMedicine ? selectedMedicine.name : "Select medicine..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] sm:w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search medicines..." />
                    <CommandEmpty>No medicines found</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-auto">
                      {inventory.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.name}
                          onSelect={() => setSelectedMedicine(item)}
                        >
                          {item.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Other fields remain the same */}
          
          {/* Distributor selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="distributor" className="text-right">
              Distributor
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              {!showNewDistributorField ? (
                <>
                  <Select onValueChange={setSelectedDistributor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select distributor" />
                    </SelectTrigger>
                    <SelectContent>
                      {distributors.map((distributor) => (
                        <SelectItem key={distributor.companyName} value={distributor.companyName}>
                          {distributor.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewDistributorField(true)}
                  >
                    + New
                  </Button>
                </>
              ) : (
                <Input
                  value={newDistributorName}
                  onChange={(e) => setNewDistributorName(e.target.value)}
                  placeholder="Enter new distributor name"
                />
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleAddStock}>Add Stock</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface FormData {
  name: string;
  category: string;
  stock: string;
  minStock: string;
  maxStock: string;
  purchasePrice: string;
  salePrice: string;
  totalStockPurchase: string;
  stockValue: string;
  manufacturer: string;
  distributorName: string;
  bonus: string;
  discount: string;
  expiryDate: string;
  manufacturingDate: string;
  _lastChanged: string;
}

const formatFieldValue = (value: any) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'number') return value;
  return value;
};

const InventoryControl: React.FC<InventoryControlProps> = ({ isUrdu }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItemToInventory, updateItemInInventory, removeItemFromInventory } = useContext(InventoryContext);
  const { toast } = useToast();
  // Initialize all state at the top
  const [searchTerm, setSearchTerm] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [activeTab, setActiveTab] = useState<'active'|'review'>('active');
  const [pendingInventory, setPendingInventory] = useState<InventoryItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    stock: '0',
    minStock: '10',
    maxStock: '100',
    purchasePrice: '0',
    salePrice: '0',
    totalStockPurchase: '0',
    stockValue: '0',
    manufacturer: '',
    distributorName: '',
    bonus: '0',
    discount: '0',
    expiryDate: '',
    manufacturingDate: '',
    _lastChanged: ''
  });

  // Distributor state for dropdown and add-new
  const [distributors, setDistributors] = useState<{companyName: string}[]>([]);
  const [newDistributorName, setNewDistributorName] = useState('');
  const [isDistributorDialogOpen, setIsDistributorDialogOpen] = useState(false);
  const [showAddDistributorDialog, setShowAddDistributorDialog] = useState(false);
  const [newDistributor, setNewDistributor] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    taxId: '',
    status: 'active'
  });

  // Load distributors for dropdown on mount
  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.DISTRIBUTORS);
        if (!response.ok) {
          throw new Error('Failed to fetch distributors');
        }
        const data = await response.json();
        setDistributors(data);
      } catch (error) {
        console.error('Failed to fetch distributors:', error);
      }
    };
    
    fetchDistributors();
  }, []);

  const [showBarcodeScannerInForm, setShowBarcodeScannerInForm] = useState(false);
  
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await medicineServiceBackend.getAll();
      setInventory(data);
      
      // Also fetch pending inventory for review tab
      const pendingRes = await fetch(`${API_ENDPOINTS.INVENTORY}/pending`);
      if (pendingRes.ok) {
        setPendingInventory(await pendingRes.json());
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
      setError(error instanceof Error ? error.message : 'Failed to load inventory');
      toast({
        title: isUrdu ? 'خرابی: انوینٹری لوڈ نہیں ہو سکی' : 'Error: Failed to load inventory',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Handle auto-calculation triggers
    if (name === 'stock' || name === 'purchasePrice') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        _lastChanged: name
      }));
    } else if (name === 'salePrice') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        _lastChanged: name
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Remove handleSaveInventory; handled by context methods

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const inventoryItem = {
        name: formData.name,
        category: formData.category,
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        maxStock: Number(formData.maxStock),
        purchasePrice: Number(formData.purchasePrice),
        salePrice: Number(formData.salePrice),
        manufacturer: formData.manufacturer,
        batchNo: formData.batchNo,
        expiryDate: formData.expiryDate,
        manufacturingDate: formData.manufacturingDate,
        bonus: Number(formData.bonus) || 0,
        discount: Number(formData.discount) || 0,
        distributorName: formData.distributorName
      };

      await addItemToInventory(inventoryItem);
      toast({
        title: 'Success',
        description: 'Inventory item added for review',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add inventory item',
        variant: 'destructive',
      });
    }
  };

  const handleEditItem = async (id: string) => {
    try {
      const item = inventory.find(item => item.id === id);
      if (!item) return;
      
      setFormData({
        name: item.name,
        category: item.category,
        stock: item.stock.toString(),
        minStock: item.minStock.toString(),
        maxStock: item.maxStock.toString(),
        purchasePrice: item.purchasePrice.toString(),
        salePrice: item.salePrice.toString(),
        manufacturer: item.manufacturer,
        batchNo: item.batchNo || '',
        expiryDate: item.expiryDate || '',
        manufacturingDate: item.manufacturingDate || '',
        bonus: item.bonus?.toString() || '0',
        discount: item.discount?.toString() || '0',
        distributorName: item.distributorName || ''
      });
      
      setEditingId(id);
      setIsAddDialogOpen(true);
    } catch (error) {
      toast({
        title: isUrdu ? 'خرابی: انوینٹری ایڈٹ نہیں ہو سکی' : 'Error: Failed to edit inventory',
        variant: 'destructive'
      });
    }
  };

  const handleEditSubmit = async (formData: any) => {
    try {
      const response = await fetch(`/api/inventory/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to update medicine');
      
      const updatedItem = await response.json();
      
      // Deep merge the updated fields with existing item
      setInventory(prev => prev.map(item => {
        if (item.id === updatedItem.id) {
          return {
            ...item,
            ...updatedItem,
            // Ensure all numeric fields are properly converted
            stock: Number(updatedItem.stock || item.stock),
            price: Number(updatedItem.price || item.price),
            minStock: Number(updatedItem.minStock || item.minStock),
            maxStock: Number(updatedItem.maxStock || item.maxStock),
            purchasePrice: Number(updatedItem.purchasePrice || item.purchasePrice),
            salePrice: Number(updatedItem.salePrice || item.salePrice)
          };
        }
        return item;
      }));
      
      toast({
        title: 'Success',
        description: 'Medicine updated successfully'
      });
      
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleUpdateItem = async (id: string, updatedItem: Medicine) => {
    try {
      setLoading(true);
      const updated = await medicineServiceBackend.updateMedicine(updatedItem);
      setInventory(prev => prev.map(item => item.id === id ? updated : item));
      toast({
        title: isUrdu ? 'انوینٹری اپ ڈیٹ ہو گئی' : 'Inventory updated',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: isUrdu ? 'خرابی: انوینٹری اپ ڈیٹ نہیں ہو سکی' : 'Error: Failed to update inventory',
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await medicineServiceBackend.deleteMedicine(id);
      toast({
        title: isUrdu ? 'انوینٹری حذف ہو گئی' : 'Inventory deleted',
        variant: 'default'
      });
      fetchInventoryData();
    } catch (error) {
      toast({
        title: isUrdu ? 'خرابی: انوینٹری حذف نہیں ہو سکی' : 'Error: Failed to delete inventory',
        variant: 'destructive'
      });
    }
  };

  // Add new distributor handler
  const handleAddDistributor = async () => {
    setIsDistributorDialogOpen(true);
  };

  const confirmAddDistributor = async () => {
    if (!newDistributorName.trim()) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.DISTRIBUTORS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDistributorName })
      });
      
      if (response.ok) {
        const newDist = await response.json();
        setDistributors([...distributors, {companyName: newDist.name}]);
        setFormData({...formData, distributorName: newDist.name});
        setNewDistributorName('');
        setIsDistributorDialogOpen(false);
      }
    } catch (error) {
      console.error('Error adding distributor:', error);
    }
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
      status: 'Status',
      addInventory: 'Add Inventory'
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
      status: 'حالت',
      addInventory: 'انوینٹری شامل کریں'
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
  const totalInventoryValue = useMemo(() => {
    return inventory.reduce((sum, item) => sum + (item.stock * (item.salePrice || 0)), 0);
  }, [inventory]);

  const totalPurchaseAmount = useMemo(() => {
    return inventory.reduce((sum, item) => sum + (item.stock * (item.unitPrice || 0)), 0);
  }, [inventory]);

  const totalStockQuantity = useMemo(() => {
    return inventory.reduce((sum, item) => sum + (item.stock || 0), 0);
  }, [inventory]);

  const lowStockCount = inventory.filter(item => item.stock < 10).length;
  const expiringSoonCount = inventory.filter(item => {
    if (!item.expiryDate) return false;
    const expiry = new Date(item.expiryDate);
    const today = new Date();
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;
  const outOfStockCount = inventory.filter(item => item.stock <= 0).length;

  const [distributorFilter, setDistributorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [invoiceFilter, setInvoiceFilter] = useState('');

  const filteredInventory = useMemo(() => {
    if (activeTab === 'lowStock') {
      return inventory.filter(item => 
        item.stock > 0 && item.stock < (item.minStock || 10)
      );
    }
    if (activeTab === 'expiring') {
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);
      return inventory.filter(item => 
        item.expiryDate && 
        new Date(item.expiryDate) <= nextMonth &&
        new Date(item.expiryDate) >= today
      );
    }
    if (activeTab === 'outOfStock') {
      return inventory.filter(item => item.stock <= 0);
    }
    return inventory;
  }, [inventory, activeTab]);

  const filterInventory = () => {
    const filteredItems = filteredInventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                          (item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                          (item.barcode?.includes(searchTerm) ?? false);
      const matchesDistributor = !distributorFilter || 
        item.distributorName?.toLowerCase().includes(distributorFilter.toLowerCase());
      const matchesDate = !dateFilter || 
        new Date(item.purchaseDate).toDateString() === dateFilter.toDateString();
      const matchesInvoice = !invoiceFilter || 
        item.invoiceNumber?.toLowerCase().includes(invoiceFilter.toLowerCase());
      
      return matchesSearch && matchesDistributor && matchesDate && matchesInvoice;
    });
    return filteredItems;
  };

  const filteredItems = filterInventory();

  const handleDeleteInventory = (id: number) => {
    removeItemFromInventory(id);
    toast({
      title: isUrdu ? 'کامیابی' : 'Success',
      description: isUrdu ? 'اسٹاک آئٹم کامیابی سے حذف ہو گیا' : 'Inventory item deleted successfully',
    });
  };

  const loadInventory = async () => {
    await fetchInventoryData();
  };

  const handleExport = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const headers = [
        'ID', 'Medicine Name', 'Generic Name', 'Category', 'Manufacturer',
        'Stock', 'Min Stock', 'Max Stock', 'Unit Price', 'Total Value',
        'Barcode', 'Manufacturing Date', 'Expiry Date', 'Status', 'Expiry Status'
      ];

      const rows = filteredItems.map(item => {
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

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `inventory_export_${today}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);

      toast({
        title: isUrdu ? 'برآمدگی کامیاب' : 'Export Successful',
        description: isUrdu 
          ? `انوینٹری کی ${rows.length} اشیاء کامیابی سے برآمد ہو گئی ہیں` 
          : `Successfully exported ${rows.length} items`,
        duration: 3000
      });
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
    }
  };

  const handleApproveInventory = async (itemId: string) => {
    try {
      await updateInventoryItem(itemId, { status: 'approved' });
      toast({
        title: isUrdu ? 'انوینٹری منظور ہو گئی' : 'Inventory approved',
        variant: 'default'
      });
      fetchInventoryData();
    } catch (error) {
      toast({
        title: isUrdu ? 'خرابی: انوینٹری منظور نہیں ہو سکی' : 'Error: Inventory approval failed',
        variant: 'destructive'
      });
    }
  };

  const handleRejectInventory = async (itemId: string) => {
    try {
      await deleteInventoryItem(itemId);
      toast({
        title: isUrdu ? 'انوینٹری مسترد ہو گئی' : 'Inventory rejected',
        variant: 'default'
      });
      fetchInventoryData();
    } catch (error) {
      toast({
        title: isUrdu ? 'خرابی: انوینٹری مسترد نہیں ہو سکی' : 'Error: Inventory rejection failed',
        variant: 'destructive'
      });
    }
  };

  const handleAddNewDistributor = async () => {
    const name = prompt('Enter new distributor name');
    if (!name) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.DISTRIBUTORS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      
      if (response.ok) {
        const newDist = await response.json();
        setDistributors([...distributors, {companyName: newDist.name}]);
        setFormData({...formData, distributorName: newDist.name});
      }
    } catch (error) {
      console.error('Error adding distributor:', error);
    }
  };

  const [medicineNames, setMedicineNames] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const loadMedicineNames = async () => {
      try {
        const response = await fetch('/medicine-database.csv');
        const text = await response.text();
        const names = text.split('\n')
          .slice(1) // Skip header
          .map(line => line.split(',')[1]) // Column B
          .filter(name => name && name.trim());
        setMedicineNames(names);
      } catch (error) {
        console.error('Error loading medicine names:', error);
      }
    };
    loadMedicineNames();
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const filtered = medicineNames.filter(name => 
        name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 100)); // Limit to 100 items
    } else {
      setFilteredSuggestions(medicineNames.slice(0, 50)); // Show first 50 when empty
    }
  }, [debouncedSearchTerm, medicineNames]);

  const handleMedicineNameChange = (value: string) => {
    setSearchTerm(value);
    setFormData(prev => ({
      ...prev,
      name: value
    }));
    setFilteredSuggestions([]);
  };

  const [newMedicineName, setNewMedicineName] = useState('');
  const [isMedicineDialogOpen, setIsMedicineDialogOpen] = useState(false);

  const handleAddItem = async () => {
    try {
      setLoading(true);
      
      const newItem = {
        name: formData.name,
        category: formData.category,
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
        maxStock: parseInt(formData.maxStock),
        purchasePrice: parseFloat(formData.purchasePrice),
        salePrice: parseFloat(formData.salePrice),
        manufacturer: formData.manufacturer,
        distributorName: formData.distributorName,
        expiryDate: formData.expiryDate
      };
      
      const addedItem = await medicineServiceBackend.addMedicine(newItem);
      setInventory(prev => [...prev, addedItem]);
      
      toast({
        title: isUrdu ? 'انوینٹری آئٹم شامل کیا گیا' : 'Inventory item added',
        variant: 'default'
      });
      
      setIsAddDialogOpen(false);
      setFormData({
        /* reset form data */
      });
      
    } catch (error) {
      console.error('Failed to add item:', error);
      toast({
        title: isUrdu ? 'خرابی: آئٹم شامل نہیں کیا جا سکا' : 'Error: Failed to add item',
        variant: 'destructive',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={loadInventory}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t.refresh}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              {t.export}
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t.addInventory}
            </Button>
            <BulkInventoryImport onImportComplete={loadInventory} />
            <AddStockDialog inventory={inventory} distributors={distributors} onStockAdded={loadInventory} />
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
                  <p className="text-sm text-gray-600">Total Inventory Value</p>
                  <p className="text-2xl font-bold text-green-600">PKR {totalInventoryValue.toLocaleString()}</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Purchase Amount</p>
                  <p className="text-2xl font-bold text-green-600">PKR {totalPurchaseAmount.toLocaleString()}</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Stock Quantity</p>
                  <p className="text-2xl font-bold text-green-600">{totalStockQuantity}</p>
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
                  <p className="text-2xl font-bold text-orange-600">{expiringSoonCount}</p>
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
              onChange={(e) => handleMedicineNameChange(e.target.value)}
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
          <div className="flex gap-2 mb-4">
            <Input 
              placeholder="Filter by distributor"
              value={distributorFilter}
              onChange={(e) => setDistributorFilter(e.target.value)}
            />
            <DatePicker
              selected={dateFilter}
              onChange={(date) => setDateFilter(date)}
              placeholderText="Filter by date"
              isClearable
              selectsMultiple={false}
            />
            <Input 
              placeholder="Filter by invoice"
              value={invoiceFilter}
              onChange={(e) => setInvoiceFilter(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
          </Button>
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          {t.filter}
        </Button>
      </div>
      <div className="flex border-b mb-4">
        <Button
          variant={activeTab === 'active' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('active')}
        >
          Active Inventory
        </Button>
        <Button
          variant={activeTab === 'review' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('review')}
        >
          Inventory in Review
        </Button>
      </div>
      {activeTab === 'active' ? (
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
              {filteredItems.map((item, index) => {
                const stockStatus = getStockStatus(item.stock, item.minStock);
                const isExpiring = isExpiringSoon(item.expiryDate);
                
                return (
                  <div key={item.id} className="p-4 border rounded-lg mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.genericName}</p>
                        <p className="text-sm">{item.category}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditItem(item.id)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteInventory(item.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm">Unit Price: PKR {formatFieldValue(item.unitPrice)}</p>
                        <p className="text-sm">Sale Price: PKR {formatFieldValue(item.salePrice)}</p>
                        <p className="text-sm">Min Stock: {formatFieldValue(item.minStock)}</p>
                      </div>
                      <div>
                        <p className="text-sm">Stock: {formatFieldValue(item.stock)}</p>
                        <p className="text-sm">Total Value: PKR {(item.stock * item.salePrice)?.toFixed(2)}</p>
                        <p className="text-sm">Max Stock: {formatFieldValue(item.maxStock)}</p>
                      </div>
                      <div>
                        <p className="text-sm">Batch: {formatFieldValue(item.batchNo)}</p>
                        <p className="text-sm">Expiry: {formatFieldValue(item.expiryDate)}</p>
                        <p className="text-sm">Manufacturer: {formatFieldValue(item.manufacturer)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4">
          {pendingInventory.map((item, index) => {
            return (
              <div key={item.id || `pending-item-${index}`} className="p-4 border rounded-lg mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.genericName}</p>
                    <p className="text-sm">{item.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleApproveInventory(item.id)}>
                      Approve
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleRejectInventory(item.id)}>
                      Reject
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm">Unit Price: PKR {formatFieldValue(item.unitPrice)}</p>
                    <p className="text-sm">Sale Price: PKR {formatFieldValue(item.salePrice)}</p>
                    <p className="text-sm">Min Stock: {formatFieldValue(item.minStock)}</p>
                  </div>
                  <div>
                    <p className="text-sm">Stock: {formatFieldValue(item.stock)}</p>
                    <p className="text-sm">Total Value: PKR {(item.stock * item.salePrice)?.toFixed(2)}</p>
                    <p className="text-sm">Max Stock: {formatFieldValue(item.maxStock)}</p>
                  </div>
                  <div>
                    <p className="text-sm">Batch: {formatFieldValue(item.batchNo)}</p>
                    <p className="text-sm">Expiry: {formatFieldValue(item.expiryDate)}</p>
                    <p className="text-sm">Manufacturer: {formatFieldValue(item.manufacturer)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-indigo-700 mb-2">
              {isUrdu ? 'نیا انوینٹری شامل کریں' : 'Add New Inventory'}
            </DialogTitle>
            <div className="border-b border-indigo-100 pb-4"></div>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-indigo-700 font-medium">{isUrdu ? 'نام' : 'Name'}</Label>
                <Select 
                  value={formData.name}
                  onValueChange={(value) => {
                    if (value === 'add_new') {
                      setIsMedicineDialogOpen(true);
                    } else {
                      setFormData(prev => ({...prev, name: value}));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isUrdu ? 'دوا کا نام' : 'Medicine name'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-auto">
                    <Command>
                      <CommandInput 
                        placeholder={isUrdu ? 'تلاش کریں...' : 'Search...'}
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                      />
                      <CommandEmpty>
                        <Dialog open={isMedicineDialogOpen} onOpenChange={setIsMedicineDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="w-full"
                              onClick={() => setIsMedicineDialogOpen(true)}
                            >
                              {isUrdu ? '+ نیا دوا شامل کریں' : '+ Add New Medicine'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>{isUrdu ? 'نیا دوا شامل کریں' : 'Add New Medicine'}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                  {isUrdu ? 'نام' : 'Name'}
                                </Label>
                                <Input
                                  id="name"
                                  value={newMedicineName}
                                  onChange={(e) => setNewMedicineName(e.target.value)}
                                  className="col-span-3"
                                  autoFocus
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setIsMedicineDialogOpen(false)}>
                                {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                              </Button>
                              <Button 
                                type="button" 
                                onClick={() => {
                                  if (newMedicineName.trim()) {
                                    setFormData(prev => ({...prev, name: newMedicineName}));
                                    setIsMedicineDialogOpen(false);
                                    setNewMedicineName('');
                                  }
                                }}
                              >
                                {isUrdu ? 'محفوظ کریں' : 'Save'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredSuggestions.map((name, index) => (
                          <CommandItem 
                            key={`${name}-${index}`}
                            value={name}
                            onSelect={() => setFormData(prev => ({...prev, name: name}))}
                          >
                            {name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-indigo-700 font-medium">{isUrdu ? 'قسم' : 'Category'}</Label>
                <Select onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}>
                  <SelectTrigger className="border-indigo-200 focus:ring-2 focus:ring-indigo-300">
                    <SelectValue placeholder={isUrdu ? 'قسم منتخب کریں' : 'Select category'} />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-lg rounded-md">
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">{isUrdu ? 'ڈسٹریبیوٹر' : 'Distributor'}</Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.distributorName}
                    onValueChange={(value) => setFormData({...formData, distributorName: value})}
                    className="flex-1"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select distributor" />
                    </SelectTrigger>
                    <SelectContent>
                      {distributors.map(dist => (
                        <SelectItem key={dist.companyName} value={dist.companyName}>
                          {dist.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleAddDistributor}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-indigo-700 font-medium">{isUrdu ? 'اسٹاک' : 'Stock'}</Label>
                  <Input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="border-indigo-200 focus:ring-2 focus:ring-indigo-300"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-indigo-700 font-medium">{isUrdu ? 'خریداری قیمت' : 'Purchase Price'}</Label>
                  <Input
                    name="purchasePrice"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    className="border-indigo-200 focus:ring-2 focus:ring-indigo-300"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-indigo-700 font-medium">{isUrdu ? 'فروخت قیمت' : 'Sale Price'}</Label>
                  <Input
                    name="salePrice"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={handleInputChange}
                    className="border-indigo-200 focus:ring-2 focus:ring-indigo-300"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-indigo-700 font-medium">{isUrdu ? 'کل خریداری' : 'Total Purchase'}</Label>
                  <Input
                    name="totalStockPurchase"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.totalStockPurchase}
                    onChange={handleInputChange}
                    className="border-indigo-200 focus:ring-2 focus:ring-indigo-300 bg-indigo-50"
                    readOnly
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-indigo-700 font-medium">{isUrdu ? 'اسٹاک ویلیو' : 'Stock Value'}</Label>
                <Input
                  name="stockValue"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.stockValue}
                  className="border-indigo-200 focus:ring-2 focus:ring-indigo-300 bg-indigo-50 font-semibold text-indigo-700"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label className="text-indigo-700 font-medium">{isUrdu ? 'بونس' : 'Bonus'}</Label>
                <Input
                  name="bonus"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.bonus}
                  onChange={handleInputChange}
                  className="border-indigo-200 focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-indigo-700 font-medium">{isUrdu ? 'ڈسکاؤنٹ' : 'Discount'}</Label>
                <Input
                  name="discount"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.discount}
                  onChange={handleInputChange}
                  className="border-indigo-200 focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 px-4 pb-4">
            <Button 
              variant="outline" 
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              onClick={() => setIsAddDialogOpen(false)}
            >
              {isUrdu ? 'منسوخ کریں' : 'Cancel'}
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
              onClick={handleAddItem}
            >
              {isUrdu ? 'محفوظ کریں' : 'Save Inventory'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Add Distributor Dialog */}
      <Dialog open={isDistributorDialogOpen} onOpenChange={setIsDistributorDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isUrdu ? 'نیا ڈسٹریبیوٹر شامل کریں' : 'Add New Distributor'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {isUrdu ? 'نام' : 'Name'}
              </Label>
              <Input
                id="name"
                value={newDistributorName}
                onChange={(e) => setNewDistributorName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDistributorDialogOpen(false)}>
              {isUrdu ? 'منسوخ کریں' : 'Cancel'}
            </Button>
            <Button type="button" onClick={confirmAddDistributor}>
              {isUrdu ? 'محفوظ کریں' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Dialog */}
      {editItem && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isUrdu ? 'آئٹم میں ترمیم کریں' : 'Edit Item'}</DialogTitle>
            </DialogHeader>
            <MedicineEditForm
              isAddMode={false}
              item={editItem}
              formData={formData}
              isUrdu={isUrdu}
              distributors={distributors}
              categories={categories}
              medicines={inventory} // Pass inventory data as medicines
              onInputChange={handleInputChange}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditDialogOpen(false)}
              onAddDistributor={() => setShowAddDistributorDialog(true)}
            />
          </DialogContent>
        </Dialog>
      )}
    </React.Fragment>
  );
};

export default InventoryControl;
