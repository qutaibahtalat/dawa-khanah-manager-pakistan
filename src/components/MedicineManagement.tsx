
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  Barcode,
  Calendar,
  DollarSign,
  AlertTriangle,
  Download,
  Upload,
  Filter,
  ScanLine,
  X
} from 'lucide-react';
import { offlineManager } from '../utils/offlineManager';
import { reportExporter } from '../utils/reportExporter';
import { useToast } from '@/hooks/use-toast';

interface MedicineManagementProps {
  isUrdu: boolean;
}

// Helper functions for localStorage
const saveMedicinesToLocal = (medicines: any[]) => {
  localStorage.setItem('pharmacy_medicines', JSON.stringify(medicines));
};

const loadMedicinesFromLocal = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('pharmacy_medicines');
    return saved ? JSON.parse(saved) : [];
  }
  return [];
};

const MedicineManagement: React.FC<MedicineManagementProps> = ({ isUrdu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: '',
    manufacturer: '',
    batchNo: '',
    expiryDate: '',
    purchasePrice: '',
    salePrice: '',
    quantity: '',
    barcode: '',
    minStock: '10',
    maxStock: '100'
  });
  const [medicines, setMedicines] = useState(() => loadMedicinesFromLocal());
  const { toast } = useToast();
  
  // Save to localStorage whenever medicines change
  useEffect(() => {
    saveMedicinesToLocal(medicines);
  }, [medicines]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteMedicine = (id: number) => {
    if (window.confirm(isUrdu ? 'کیا آپ واقعی یہ دوا حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this medicine?')) {
      const updatedMedicines = medicines.filter(medicine => medicine.id !== id);
      setMedicines(updatedMedicines);
      
      toast({
        title: isUrdu ? 'کامیابی' : 'Success',
        description: isUrdu ? 'دوا کامیابی سے حذف ہو گئی' : 'Medicine deleted successfully',
      });
    }
  };

  const handleEditMedicine = (medicine: any) => {
    setFormData({
      name: medicine.name,
      genericName: medicine.genericName,
      category: medicine.category,
      manufacturer: medicine.manufacturer,
      batchNo: medicine.batchNo,
      expiryDate: medicine.expiryDate,
      purchasePrice: medicine.purchasePrice.toString(),
      salePrice: medicine.salePrice.toString(),
      quantity: medicine.quantity.toString(),
      barcode: medicine.barcode || '',
      minStock: medicine.minStock.toString(),
      maxStock: medicine.maxStock.toString()
    });
    setEditingId(medicine.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.genericName || !formData.category) {
      toast({
        title: isUrdu ? 'خرابی' : 'Error',
        description: isUrdu ? 'براہ کرم تمام ضروری فیلڈز بھریں' : 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const medicineData = {
      id: editingId || Date.now(),
      name: formData.name,
      genericName: formData.genericName,
      category: formData.category,
      manufacturer: formData.manufacturer,
      batchNo: formData.batchNo,
      expiryDate: formData.expiryDate || new Date().toISOString().split('T')[0],
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      salePrice: parseFloat(formData.salePrice) || 0,
      quantity: parseInt(formData.quantity) || 0,
      barcode: formData.barcode,
      minStock: parseInt(formData.minStock) || 10,
      maxStock: parseInt(formData.maxStock) || 100,
      status: 'In Stock'
    };

    let updatedMedicines;
    if (editingId) {
      // Update existing medicine
      updatedMedicines = medicines.map(medicine => 
        medicine.id === editingId ? medicineData : medicine
      );
    } else {
      // Add new medicine
      updatedMedicines = [...medicines, medicineData];
    }
    setMedicines(updatedMedicines);
    
    // Reset form and state
    setFormData({
      name: '',
      genericName: '',
      category: '',
      manufacturer: '',
      batchNo: '',
      expiryDate: '',
      purchasePrice: '',
      salePrice: '',
      quantity: '',
      barcode: '',
      minStock: '10',
      maxStock: '100'
    });
    setEditingId(null);
    setShowAddForm(false);
    
    toast({
      title: isUrdu ? 'کامیابی' : 'Success',
      description: isUrdu 
        ? `دوا ${editingId ? 'اپ ڈیٹ' : 'شامل'} کر دی گئی ہے`
        : `Medicine ${editingId ? 'updated' : 'added'} successfully`,
    });
  };

  const text = {
    en: {
      title: 'Medicine Management',
      searchPlaceholder: 'Search medicines...',
      addNew: 'Add New Medicine',
      exportInventory: 'Export Inventory',
      bulkImport: 'Bulk Import',
      scanBarcode: 'Scan Barcode',
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
      minStock: 'Min Stock',
      maxStock: 'Max Stock',
      save: 'Save Medicine',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      inStock: 'In Stock',
      lowStock: 'Low Stock',
      outOfStock: 'Out of Stock',
      expiringSoon: 'Expiring Soon',
      filterBy: 'Filter by Category',
      sortBy: 'Sort by',
      all: 'All Categories',
      expiryAlert: 'Expires in',
      days: 'days',
      lowStockAlert: 'Low Stock Alert'
    },
    ur: {
      title: 'ادویات کا انتظام',
      searchPlaceholder: 'ادویات تلاش کریں...',
      addNew: 'نئی دوا شامل کریں',
      exportInventory: 'انوینٹری ایکسپورٹ',
      bulkImport: 'بلک امپورٹ',
      scanBarcode: 'بار کوڈ اسکین',
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
      minStock: 'کم سے کم اسٹاک',
      maxStock: 'زیادہ سے زیادہ اسٹاک',
      save: 'دوا محفوظ کریں',
      cancel: 'منسوخ',
      edit: 'تبدیل کریں',
      delete: 'حذف کریں',
      inStock: 'اسٹاک میں',
      lowStock: 'کم اسٹاک',
      outOfStock: 'اسٹاک ختم',
      expiringSoon: 'جلد ختم ہونے والی',
      filterBy: 'قسم کے ذریعے فلٹر',
      sortBy: 'ترتیب دیں',
      all: 'تمام اقسام',
      expiryAlert: 'میں ختم ہو جائے گی',
      days: 'دن',
      lowStockAlert: 'کم اسٹاک کی خبردار'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Load medicines from offline storage
  useEffect(() => {
    const storedMedicines = offlineManager.getData('medicines');
    if (storedMedicines && storedMedicines.length > 0) {
      setMedicines(storedMedicines);
    }
  }, []);

  // Save medicines to offline storage
  useEffect(() => {
    offlineManager.saveData('medicines', medicines);
  }, [medicines]);

  const categories = ['all', 'Analgesic', 'Antibiotic', 'Antacid', 'Antihistamine', 'Cardiac', 'Respiratory'];

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity === 0) return { status: t.outOfStock, color: 'destructive' };
    if (quantity <= minStock) return { status: t.lowStock, color: 'secondary' };
    return { status: t.inStock, color: 'default' };
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isExpiringSoon = (expiryDate: string, threshold: number = 30) => {
    return getDaysUntilExpiry(expiryDate) <= threshold;
  };

  const filteredMedicines = medicines
    .filter(medicine => {
      const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           medicine.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           medicine.barcode.includes(searchTerm);
      const matchesCategory = filterCategory === 'all' || medicine.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'expiry':
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        case 'stock':
          return a.quantity - b.quantity;
        case 'price':
          return a.salePrice - b.salePrice;
        default:
          return 0;
      }
    });

  const handleExportInventory = () => {
    const exportData = reportExporter.exportInventoryReport(medicines);
    reportExporter.exportToExcel(exportData);
    toast({
      title: "Export Successful",
      description: "Inventory report has been exported successfully."
    });
  };

  const handleBulkImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Handle bulk import logic here
        toast({
          title: "Import Started",
          description: "Processing bulk import file..."
        });
      }
    };
    input.click();
  };

  const handleScanBarcode = () => {
    // Simulate barcode scanning
    const simulatedBarcode = '123456789' + Math.floor(Math.random() * 1000);
    setSearchTerm(simulatedBarcode);
    toast({
      title: "Barcode Scanned",
      description: `Barcode: ${simulatedBarcode}`
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-headline font-poppins text-gray-900">{t.title}</h1>
        <div className="flex space-x-2">
          <Button onClick={handleBulkImport} variant="outline" className="touch-target">
            <Upload className="h-4 w-4 mr-2" />
            {t.bulkImport}
          </Button>
          <Button onClick={handleExportInventory} variant="outline" className="touch-target">
            <Download className="h-4 w-4 mr-2" />
            {t.exportInventory}
          </Button>
          <Button onClick={handleScanBarcode} variant="outline" className="touch-target">
            <ScanLine className="h-4 w-4 mr-2" />
            {t.scanBarcode}
          </Button>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center space-x-2 touch-target">
            <Plus className="h-4 w-4" />
            <span>{t.addNew}</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 font-poppins"
          />
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger>
            <SelectValue placeholder={t.filterBy} />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? t.all : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder={t.sortBy} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="expiry">Expiry Date</SelectItem>
            <SelectItem value="stock">Stock Level</SelectItem>
            <SelectItem value="price">Price</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Add Medicine Form */}
      {showAddForm && (
        <Card className="animate-slide-in">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold font-poppins">
                {isUrdu 
                  ? editingId ? 'دوا میں ترمیم کریں' : 'نئی دوا شامل کریں'
                  : editingId ? 'Edit Medicine' : 'Add New Medicine'}
              </h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  setFormData({
                    name: '',
                    genericName: '',
                    category: '',
                    manufacturer: '',
                    batchNo: '',
                    expiryDate: '',
                    purchasePrice: '',
                    salePrice: '',
                    quantity: '',
                    barcode: '',
                    minStock: '10',
                    maxStock: '100'
                  });
                }}
                className="rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveMedicine}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-poppins">{t.medicineName} *</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t.medicineName} 
                    className="font-poppins" 
                    required 
                  />
                </div>
              <div className="space-y-2">
                <Label htmlFor="genericName" className="font-poppins">{t.genericName} *</Label>
                <Input 
                  id="genericName" 
                  value={formData.genericName}
                  onChange={handleInputChange}
                  placeholder={t.genericName} 
                  className="font-poppins" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="font-poppins">{t.category} *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange(value, 'category')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.category} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer" className="font-poppins">{t.manufacturer}</Label>
                <Input 
                  id="manufacturer" 
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  placeholder={t.manufacturer} 
                  className="font-poppins" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batchNo" className="font-poppins">{t.batchNo}</Label>
                <Input 
                  id="batchNo" 
                  value={formData.batchNo}
                  onChange={handleInputChange}
                  placeholder={t.batchNo} 
                  className="font-poppins" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="font-poppins">{t.expiryDate}</Label>
                <Input 
                  id="expiryDate" 
                  type="date" 
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="font-poppins" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasePrice" className="font-poppins">{t.purchasePrice}</Label>
                <Input 
                  id="purchasePrice" 
                  type="number" 
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  placeholder="0.00" 
                  className="font-poppins" 
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice" className="font-poppins">{t.salePrice}</Label>
                <Input 
                  id="salePrice" 
                  type="number" 
                  value={formData.salePrice}
                  onChange={handleInputChange}
                  placeholder="0.00" 
                  className="font-poppins" 
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity" className="font-poppins">{t.quantity}</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="0" 
                  className="font-poppins" 
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock" className="font-poppins">{t.minStock}</Label>
                <Input 
                  id="minStock" 
                  type="number" 
                  value={formData.minStock}
                  onChange={handleInputChange}
                  placeholder="10" 
                  className="font-poppins" 
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStock" className="font-poppins">{t.maxStock}</Label>
                <Input 
                  id="maxStock" 
                  type="number" 
                  value={formData.maxStock}
                  onChange={handleInputChange}
                  placeholder="100" 
                  className="font-poppins" 
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode" className="font-poppins">{t.barcode}</Label>
                <Input 
                  id="barcode" 
                  value={formData.barcode}
                  onChange={handleInputChange}
                  placeholder={t.barcode} 
                  className="font-poppins" 
                />
              </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowAddForm(false)} 
                  className="touch-target font-poppins"
                >
                  {t.cancel}
                </Button>
                <Button 
                  type="submit"
                  className="touch-target font-poppins"
                >
                  {t.save}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Medicine List */}
      <div className="grid gap-4">
        {filteredMedicines.map((medicine) => {
          const stockStatus = getStockStatus(medicine.quantity, medicine.minStock);
          const daysUntilExpiry = getDaysUntilExpiry(medicine.expiryDate);
          const expiringSoon = isExpiringSoon(medicine.expiryDate);
          
          return (
            <Card key={medicine.id} className="transition-all hover:shadow-md animate-slide-in">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 flex-1">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1 font-poppins">{medicine.name}</h3>
                      <p className="text-sm text-gray-600 font-poppins">{medicine.genericName}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Badge variant="outline" className="font-poppins">{medicine.category}</Badge>
                        {expiringSoon && (
                          <Badge variant="destructive" className="font-poppins">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {t.expiringSoon}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="font-poppins">{medicine.manufacturer}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Barcode className="h-4 w-4 text-gray-400" />
                        <span className="font-poppins">{medicine.barcode}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-poppins">{medicine.expiryDate}</span>
                      </div>
                      {expiringSoon && (
                        <div className="text-xs text-red-600 font-poppins">
                          {t.expiryAlert} {daysUntilExpiry} {t.days}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 font-poppins">
                        Batch: {medicine.batchNo}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="font-poppins">PKR {medicine.salePrice}</span>
                      </div>
                      <div className="text-xs text-gray-500 font-poppins">
                        Cost: PKR {medicine.purchasePrice}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 font-poppins">Stock: {medicine.quantity}</span>
                        <Badge variant={stockStatus.color as any} className="font-poppins">{stockStatus.status}</Badge>
                      </div>
                      {medicine.quantity <= medicine.minStock && (
                        <div className="text-xs text-orange-600 font-poppins">
                          {t.lowStockAlert}: Min {medicine.minStock}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="touch-target"
                      onClick={() => handleEditMedicine(medicine)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="touch-target text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDeleteMedicine(medicine.id)}
                    >
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
