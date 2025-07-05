import React, { useState, useEffect } from 'react';
import { medicineServiceBackend } from '@/services/medicineService.backend';
import { useAuditLog } from '@/contexts/AuditLogContext';
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
  X,
  RefreshCw
} from 'lucide-react';
import { offlineManager } from '../utils/offlineManager';
import { reportExporter } from '../utils/reportExporter';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DoubleConfirmDialog } from './ui/DoubleConfirmDialog';
import { Medicine } from '@/types/medicine';

interface MedicineManagementProps {
  isUrdu: boolean;
}

// Backend migration: Remove localStorage helpers

const MedicineManagement: React.FC<MedicineManagementProps> = ({ isUrdu }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const { logAction } = useAuditLog();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [manufacturerFilter, setManufacturerFilter] = useState<string>(''); // Add state for manufacturer filter
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
    maxStock: '100',
    isProtected: 'false' // Store as string for Select component
  });
  const [medicines, setMedicines] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Load medicines from backend on mount
  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      try {
        const meds = await medicineServiceBackend.getAll();
        setMedicines(meds);
        setError(null);
      } catch (e) {
        setError('Failed to load medicines');
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

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

  const handleDeleteMedicine = async (id: string) => {
    if (!window.confirm(isUrdu ? 'کیا آپ واقعی یہ دوا حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this medicine?')) return;
    setLoading(true);
    try {
      await medicineServiceBackend.deleteMedicine(id);
      setMedicines(await medicineServiceBackend.getAll());
      const medicineToDelete = medicines.find(m => m.id === id);
      logAction('DELETE_MEDICINE', 
        isUrdu ? `دوا حذف کی گئی: ${medicineToDelete?.name}` : `Deleted medicine: ${medicineToDelete?.name}`,
        'medicine',
        id.toString()
      );
      toast({
        title: isUrdu ? 'کامیابی' : 'Success',
        description: isUrdu ? 'دوا کامیابی سے حذف ہو گئی' : 'Medicine deleted successfully',
      });
    } catch (e) {
      toast({ title: isUrdu ? 'خرابی' : 'Error', description: isUrdu ? 'دوا حذف نہیں ہو سکی' : 'Failed to delete medicine', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteMedicine = async () => {
    if (deleteTargetId === null) return;
    setLoading(true);
    try {
      await medicineServiceBackend.deleteMedicine(deleteTargetId.toString());
      setMedicines(await medicineServiceBackend.getAll());
      const medicineToDelete = medicines.find(m => m.id === deleteTargetId);
      logAction('DELETE_MEDICINE', 
        isUrdu ? `دوا حذف کی گئی: ${medicineToDelete?.name}` : `Deleted medicine: ${medicineToDelete?.name}`,
        'medicine',
        deleteTargetId.toString()
      );
      toast({
        title: isUrdu ? 'کامیابی' : 'Success',
        description: isUrdu ? 'دوا کامیابی سے حذف ہو گئی' : 'Medicine deleted successfully',
      });
    } catch (e) {
      toast({ title: isUrdu ? 'خرابی' : 'Error', description: isUrdu ? 'دوا حذف نہیں ہو سکی' : 'Failed to delete medicine', variant: 'destructive' });
    } finally {
      setShowDeleteDialog(false);
      setDeleteTargetId(null);
      setLoading(false);
    }
  };

  const cancelDeleteMedicine = () => {
    setShowDeleteDialog(false);
    setDeleteTargetId(null);
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
      maxStock: medicine.maxStock.toString(),
      isProtected: medicine.isProtected ? 'true' : 'false' // Convert to string for Select component
    });
    setEditingId(medicine.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveMedicine = async (e: React.FormEvent) => {
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
      status: 'In Stock',
      isProtected: formData.isProtected === 'true' // Convert back to boolean
    };

    setLoading(true);
    try {
      if (editingId) {
        await medicineServiceBackend.updateMedicine({ ...medicineData, id: editingId });
        logAction('EDIT_MEDICINE', 
          isUrdu ? `دوا اپ ڈیٹ کی گئی: ${medicineData.name}` : `Updated medicine: ${medicineData.name}`,
          'medicine',
          editingId.toString()
        );
      } else {
        await medicineServiceBackend.addMedicine(medicineData);
        logAction('ADD_MEDICINE', 
          isUrdu ? `نئی دوا شامل کی گئی: ${medicineData.name}` : `Added new medicine: ${medicineData.name}`,
          'medicine',
          medicineData.id.toString()
        );
      }
      setMedicines(await medicineServiceBackend.getAll());
    } catch (e) {
      toast({ title: isUrdu ? 'خرابی' : 'Error', description: isUrdu ? 'دوا محفوظ نہیں ہو سکی' : 'Failed to save medicine', variant: 'destructive' });
      return;
    } finally {
      setLoading(false);
    }
    
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
      maxStock: '100',
      isProtected: 'false' // Reset to false
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
      lowStockAlert: 'Low Stock Alert',
      protected: 'Protected'
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
      lowStockAlert: 'کم اسٹاک کی خبردار',
      protected: 'محفوظ'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Load real-time inventory from inventoryService
  useEffect(() => {
    async function fetchInventory() {
      try {
        const inventory = await medicineServiceBackend.getAll();
        setMedicines(inventory);
      } catch (error) {
        setMedicines([]);
        // Optionally show error toast or message
      }
    }
    fetchInventory();
  }, []);

  const categories = ['all', 'Analgesic', 'Antibiotic', 'Antacid', 'Antihistamine', 'Cardiac', 'Respiratory'];
  const pakistaniManufacturers = ['Getz Pharma', 'Abbott Laboratories', 'GlaxoSmithKline', 'Novartis', 'Pfizer', 'Sanofi', 'Wyeth'];

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity === 0) return { status: t.outOfStock, color: 'destructive' };
    if (quantity <= minStock) return { status: t.lowStock, color: 'secondary' };
    return { status: t.inStock, color: 'default' };
  };

  const isExpiringSoon = (expiryDate: string, threshold: number = 30) => {
    return getDaysUntilExpiry(expiryDate) <= threshold;
  };

  const now = new Date();
  const filteredMedicines = medicines
    .filter(medicine => {
      const matchesSearch = medicine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (medicine.barcode?.includes(searchTerm) ?? false);
      const matchesCategory = filterCategory === 'all' || medicine.category === filterCategory;
      const matchesManufacturer = !manufacturerFilter || medicine.manufacturer === manufacturerFilter; // Filter by manufacturer
      return matchesSearch && matchesCategory && matchesManufacturer;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'expiry':
          return new Date(a.expiryDate || '').getTime() - new Date(b.expiryDate || '').getTime();
        case 'stock':
          return (a.stock || 0) - (b.stock || 0);
        case 'price':
          return (a.salePrice || 0) - (b.salePrice || 0);
        default:
          return 0;
      }
    });

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('medicine_search', searchTerm);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Persist sort/filter/search
  useEffect(() => {
    localStorage.setItem('medicine_sort', sortBy);
    localStorage.setItem('medicine_filter', filterCategory);
    localStorage.setItem('medicine_manufacturer_filter', manufacturerFilter); // Persist manufacturer filter
  }, [sortBy, filterCategory, manufacturerFilter]);

  // Load persisted UI state
  useEffect(() => {
    const persistedSearch = localStorage.getItem('medicine_search');
    const persistedSort = localStorage.getItem('medicine_sort');
    const persistedFilter = localStorage.getItem('medicine_filter');
    const persistedManufacturerFilter = localStorage.getItem('medicine_manufacturer_filter'); // Load persisted manufacturer filter
    if (persistedSearch) setSearchTerm(persistedSearch);
    if (persistedSort) setSortBy(persistedSort);
    if (persistedFilter) setFilterCategory(persistedFilter);
    if (persistedManufacturerFilter) setManufacturerFilter(persistedManufacturerFilter); // Set manufacturer filter
  }, []);

  // Out of stock
  const outOfStock = filteredMedicines.filter(med => (med.stock ?? 0) === 0);
  // Expiring soon (within 30 days)
  const expiringSoon = filteredMedicines.filter(med => {
    if (!med.expiryDate) return false;
    const expiry = new Date(med.expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  });
  // In stock and not expiring soon
  const inStock = filteredMedicines.filter(med => (med.stock ?? 0) > 0 && !expiringSoon.includes(med));

  // Double confirmation dialog for deletion
  const deleteChecklist = [
    isUrdu ? 'میں تصدیق کرتا ہوں کہ یہ عمل ناقابل واپسی ہے۔' : 'I understand this action cannot be undone.',
    isUrdu ? 'میں نے اس دوا کو چیک کر لیا ہے اور مستقل طور پر حذف کرنا چاہتا ہوں۔' : 'I have reviewed the item and wish to permanently delete it.'
  ];

  // Refresh the page completely
  const refreshPage = () => {
    window.location.reload();
  };

  // Export inventory to CSV with enhanced functionality
  const handleExportInventory = async () => {
    // Get the export button to update its state
    const exportButton = document.querySelector('button[title*="Export"]');
    let originalButtonContent = '';
    
    try {
      // Show loading state
      if (exportButton) {
        originalButtonContent = exportButton.innerHTML;
        exportButton.disabled = true;
        exportButton.innerHTML = isUrdu 
          ? '<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="4"></svg><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> برآمد ہو رہا ہے...' 
          : '<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="4"></svg><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Exporting...';
      }

      // Get current medicines from state
      const currentMedicines = [...medicines];
      
      if (currentMedicines.length === 0) {
        toast({
          title: isUrdu ? 'خبردار' : 'Warning',
          description: isUrdu 
            ? 'برآمد کرنے کے لیے کوئی ادویات دستیاب نہیں ہیں' 
            : 'No medicines available to export',
          variant: 'destructive',
          duration: 3000
        });
        return;
      }
      
      // Define CSV headers with proper encoding
      const headers = [
        'ID', 'Medicine Name', 'Generic Name', 'Category', 'Manufacturer',
        'Batch No', 'Expiry Date', 'Quantity', 'Unit', 'Purchase Price',
        'Sale Price', 'Status', 'Barcode', 'Min Stock', 'Max Stock',
        'Stock Value', 'Expiry Status', 'Days To Expire', 'Protected'
      ];

      // Calculate additional fields and format data
      const today = new Date();
      const formattedData = currentMedicines.map(medicine => {
        const expiryDate = medicine.expiryDate ? new Date(medicine.expiryDate) : null;
        const daysToExpire = expiryDate ? 
          Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
        
        const stockValue = (parseFloat(medicine.quantity || 0) * parseFloat(medicine.purchasePrice || 0)).toFixed(2);
        const isExpired = expiryDate && expiryDate < today;
        const isExpiringSoon = expiryDate && daysToExpire && daysToExpire <= 30 && daysToExpire > 0;
        
        let expiryStatus = 'Valid';
        if (isExpired) expiryStatus = 'Expired';
        else if (isExpiringSoon) expiryStatus = 'Expiring Soon';
        else if (!expiryDate) expiryStatus = 'Not Set';

        return {
          id: medicine.id || '',
          name: medicine.name || '',
          genericName: medicine.genericName || '',
          category: medicine.category || '',
          manufacturer: medicine.manufacturer || '',
          batchNo: medicine.batchNo || '',
          expiryDate: medicine.expiryDate || '',
          quantity: medicine.quantity || 0,
          unit: medicine.unit || 'PCS',
          purchasePrice: parseFloat(medicine.purchasePrice || 0).toFixed(2),
          salePrice: parseFloat(medicine.salePrice || 0).toFixed(2),
          status: medicine.quantity === 0 ? 'Out of Stock' : 
                  medicine.quantity <= (medicine.minStock || 10) ? 'Low Stock' : 'In Stock',
          barcode: medicine.barcode || '',
          minStock: medicine.minStock || 10,
          maxStock: medicine.maxStock || 100,
          stockValue,
          expiryStatus,
          daysToExpire: daysToExpire !== null ? daysToExpire : 'N/A',
          protected: medicine.isProtected ? 'Yes' : 'No'
        };
      });

      // Create CSV content with proper escaping
      const csvContent = [
        '\uFEFF' + headers.join(','), // Add BOM for Excel compatibility
        ...formattedData.map(item => 
          Object.values(item).map(field => 
            `"${String(field || '').replace(/"/g, '""')}"`
          ).join(',')
        )
      ].join('\r\n');

      // Create a Blob with the CSV content
      const blob = new Blob([csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      // Create and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
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
          ? `انوینٹری کی ${currentMedicines.length} اشیاء کامیابی سے برآمد ہو گئی ہیں` 
          : `Successfully exported ${currentMedicines.length} items`,
        duration: 3000
      });
      
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: isUrdu ? 'برآمدگی میں خرابی' : 'Export Failed',
        description: isUrdu 
          ? 'انوینٹری رپورٹ ڈاؤن لوڈ کرتے وقت خرابی آئی ہے' 
          : 'Failed to download inventory report',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      // Reset button state
      if (exportButton) {
        exportButton.disabled = false;
        exportButton.innerHTML = originalButtonContent || 
          (isUrdu 
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download h-4 w-4 mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>برآمد کریں'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download h-4 w-4 mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>Export');
      }
    }
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

  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');

  const handleBulkImportFile = async () => {
    if (!bulkImportFile) return;
  
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const medicines = JSON.parse(content);
        
        // Validate medicine data structure
        if (!Array.isArray(medicines) || !medicines.every(m => m.name && m.barcode)) {
          toast({
            title: 'Invalid file format',
            description: 'Please upload a valid JSON file with medicine data',
            variant: 'destructive'
          });
          return;
        }
        
        // Add to database
        await Promise.all(medicines.map(medicine => 
          addMedicine(medicine)
        ));
        
        toast({
          title: 'Bulk import successful',
          description: `Added ${medicines.length} medicines to database`
        });
        setShowBulkImport(false);
        setBulkImportFile(null);
        refreshMedicines();
      };
      reader.readAsText(bulkImportFile);
    } catch (error) {
      toast({
        title: 'Bulk import failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  const handleBarcodeScan = () => {
    setIsScanning(true);
    // In a real implementation, this would interface with a barcode scanner
    // For demo purposes, we'll simulate a scan after 2 seconds
    setTimeout(() => {
      const randomBarcode = 'P' + Math.floor(10000000 + Math.random() * 90000000);
      setScannedBarcode(randomBarcode);
      setIsScanning(false);
      
      // Auto-focus search when scan completes
      const searchInput = document.getElementById('medicine-search');
      if (searchInput) searchInput.focus();
    }, 2000);
  };

  const selectedMedicineId = medicines.find(m => m.id === deleteTargetId)?.id;

  const medicine = medicines.find(m => m.id === selectedMedicineId);

  // Add missing function implementations
  const addMedicine = async (medicine: Medicine) => {
    try {
      // Add implementation
      toast({ title: 'Medicine added', variant: 'default' });
    } catch (error) {
      toast({ title: 'Failed to add medicine', variant: 'destructive' });
    }
  };

  const deleteMedicine = async (id: string) => {
    try {
      // Add implementation
      toast({ title: 'Medicine deleted', variant: 'destructive' });
    } catch (error) {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const refreshMedicines = () => {
    // Add implementation
  };

  const [showDeleteOrderDialog, setShowDeleteOrderDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);

  const handleDeleteOrder = (orderId: number) => {
    setOrderToDelete(orderId);
    setShowDeleteOrderDialog(true);
  };

  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      const updatedMedicines = medicines.map(medicine => ({
        ...medicine,
        supplierOrders: medicine.supplierOrders?.filter(order => order.id !== orderToDelete)
      }));
      setMedicines(updatedMedicines);
      saveMedicinesToLocal(updatedMedicines);
      setShowDeleteOrderDialog(false);
      setOrderToDelete(null);
      toast({
        title: isUrdu ? 'آرڈر حذف ہو گیا' : 'Order Deleted',
        description: isUrdu ? 'سپلائر کا آرڈر کامیابی سے حذف ہو گیا' : 'Supplier order deleted successfully',
        variant: 'default'
      });
    }
  };

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleAddSupplierOrder = (medicineId: number, orderData: any) => {
    const updatedMedicines = medicines.map(medicine => {
      if (medicine.id === medicineId) {
        // Update inventory quantity
        const newQuantity = medicine.stock + orderData.quantity;
        
        return {
          ...medicine,
          stock: newQuantity,
          supplierOrders: [...(medicine.supplierOrders || []), orderData]
        };
      }
      return medicine;
    });
    
    setMedicines(updatedMedicines);
    saveMedicinesToLocal(updatedMedicines);
    
    toast({
      title: isUrdu ? 'آرڈر شامل کیا گیا' : 'Order Added',
      description: isUrdu 
        ? 'سپلائر کا آرڈر کامیابی سے شامل کر دیا گیا اور انوینٹری اپ ڈیٹ ہو گئی' 
        : 'Supplier order added successfully and inventory updated',
      variant: 'default'
    });
  };

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-headline font-poppins text-gray-900">{t.title}</h1>
          <div className="flex space-x-2">
            <Button 
              onClick={refreshPage} 
              variant="outline" 
              className="touch-target"
              title={isUrdu ? 'صفحہ تازہ کریں' : 'Refresh Page'}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isUrdu ? 'صفحہ تازہ کریں' : 'Refresh Page'}
            </Button>
            <Button 
              onClick={() => setShowBulkImport(true)} 
              variant="outline" 
              className="touch-target"
              title={t.bulkImport}
            >
              <Upload className="h-4 w-4 mr-2" />
              {t.bulkImport}
            </Button>
            <Button 
              onClick={handleExportInventory} 
              variant="outline" 
              className="touch-target"
              title={t.exportInventory}
            >
              <Download className="h-4 w-4 mr-2" />
              {t.exportInventory}
            </Button>
            <Button 
              onClick={handleBarcodeScan} 
              variant="outline" 
              className="touch-target"
              title={t.scanBarcode}
            >
              <ScanLine className="h-4 w-4 mr-2" />
              {t.scanBarcode}
            </Button>
            <Button 
              onClick={() => setShowAddForm(true)} 
              className="flex items-center space-x-2 touch-target"
              title={t.addNew}
            >
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
          
          <Select 
            value={filterCategory}
            onValueChange={setFilterCategory}
          >
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

          <Select 
            value={manufacturerFilter}
            onValueChange={setManufacturerFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by manufacturer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manufacturers</SelectItem>
              <SelectItem value="getz-pharma">Getz Pharma</SelectItem>
              <SelectItem value="abbott">Abbott Laboratories</SelectItem>
              <SelectItem value="glaxo-smithkline">GlaxoSmithKline</SelectItem>
              <SelectItem value="novartis">Novartis</SelectItem>
              <SelectItem value="pfizer">Pfizer</SelectItem>
              <SelectItem value="sanofi">Sanofi</SelectItem>
              <SelectItem value="wyeth">Wyeth</SelectItem>
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
                      maxStock: '100',
                      isProtected: 'false' // Reset to false
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
                <div className="space-y-2">
                  <Label htmlFor="isProtected" className="font-poppins">{t.protected}</Label>
                  <Select 
                    value={formData.isProtected} 
                    onValueChange={(value) => setFormData({...formData, isProtected: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.protected} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
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

        {/* Out of Stock Section */}
{outOfStock.length > 0 && (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-red-700 mb-2">{t.outOfStock}</h2>
    <div className="grid gap-3">
      {outOfStock.map((medicine) => (
        <Card key={medicine.id} className={medicine.isProtected ? 'border-l-4 border-yellow-500' : ''}>
          {medicine.isProtected && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              {t.protected}
            </Badge>
          )}
          <CardContent className="p-4 flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <span className="font-semibold">{medicine.name}</span> <span className="text-xs text-gray-500">({medicine.genericName})</span>
              <Badge variant="destructive" className="ml-2">{t.outOfStock}</Badge>
            </div>
            <div className="text-xs text-gray-600">Batch: {medicine.batchNo} | Exp: {medicine.expiryDate}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)}
{/* Expiring Soon Section */}
{expiringSoon.length > 0 && (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-orange-600 mb-2">{t.expiringSoon}</h2>
    <div className="grid gap-3">
      {expiringSoon.map((medicine) => {
        const expiry = new Date(medicine.expiryDate!);
        const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return (
          <Card key={medicine.id} className={medicine.isProtected ? 'border-l-4 border-yellow-500' : ''}>
            {medicine.isProtected && (
              <Badge variant="secondary" className="absolute top-2 right-2">
                {t.protected}
              </Badge>
            )}
            <CardContent className="p-4 flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <span className="font-semibold">{medicine.name}</span> <span className="text-xs text-gray-500">({medicine.genericName})</span>
                <Badge variant="warning" className="ml-2">{t.expiringSoon} ({days} {t.days})</Badge>
              </div>
              <div className="text-xs text-gray-600">Batch: {medicine.batchNo} | Exp: {medicine.expiryDate}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  </div>
)}
{/* In Stock Section */}
{inStock.length > 0 && (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-green-700 mb-2">{t.inStock}</h2>
    <div className="grid gap-3">
      {inStock.map((medicine) => (
        <Card key={medicine.id} className={medicine.isProtected ? 'border-l-4 border-yellow-500' : ''}>
          {medicine.isProtected && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              {t.protected}
            </Badge>
          )}
          <CardContent className="p-4 flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <span className="font-semibold">{medicine.name}</span> <span className="text-xs text-gray-500">({medicine.genericName})</span>
              <Badge variant="outline" className="ml-2">{t.inStock}</Badge>
            </div>
            <div className="flex gap-2 text-xs text-gray-600 items-center">
              <span>Stock: {medicine.stock ?? medicine.quantity}</span>
              <Button size="icon" variant="ghost" title="Edit" onClick={() => handleEditMedicine(medicine)}><Edit className="h-4 w-4" /></Button>
              <Button 
                size="icon" 
                variant="ghost" 
                title={medicine.isProtected ? 'Cannot delete protected medicine' : 'Delete'}
                disabled={medicine.isProtected}
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {medicine.supplierOrders && (
                <Button 
                  size="icon" 
                  variant="ghost" 
                  title="View Order Details"
                  onClick={() => viewOrderDetails(medicine.supplierOrders[0])}
                >
                  <Package className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)}
      </div>
      <Dialog open={showDeleteDialog} onOpenChange={() => setShowDeleteDialog(false)}>
        <DialogContent aria-describedby="medicine-dialog-description">
          <div id="medicine-dialog-description" className="sr-only">
            Dialog for managing medicine details
          </div>
          <DialogHeader>
            <DialogTitle>Delete Medicine</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>Are you sure you want to delete this medicine?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button onClick={confirmDeleteMedicine}>Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {showDeleteOrderDialog && (
        <Dialog open={showDeleteOrderDialog} onOpenChange={() => setShowDeleteOrderDialog(false)}>
          <DialogContent aria-describedby="medicine-dialog-description">
            <div id="medicine-dialog-description" className="sr-only">
              Dialog for managing medicine details
            </div>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>Are you sure you want to delete this order?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowDeleteOrderDialog(false)}>Cancel</Button>
              <Button onClick={confirmDeleteOrder}>Delete</Button>
            </div>
          </div>
        </DialogContent>
        </Dialog>
      )}
      {showOrderDetails && selectedOrder && (
        <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
          <DialogContent aria-describedby="medicine-dialog-description" className="sm:max-w-[600px]">
            <div id="medicine-dialog-description" className="sr-only">
              Dialog for managing medicine details
            </div>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Order ID
              </Label>
              <div className="col-span-3">{selectedOrder.id}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Supplier
              </Label>
              <div className="col-span-3">{selectedOrder.supplier}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Date
              </Label>
              <div className="col-span-3">{selectedOrder.date}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Quantity
              </Label>
              <div className="col-span-3">{selectedOrder.quantity}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Price
              </Label>
              <div className="col-span-3">{selectedOrder.price}</div>
            </div>
          </div>
        </DialogContent>
        </Dialog>
      )}
      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Bulk Import</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Select JSON file</Label>
                  <Input 
                    type="file" 
                    accept=".json" 
                    onChange={(e) => setBulkImportFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowBulkImport(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBulkImportFile} disabled={!bulkImportFile}>
                    Import
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default MedicineManagement;
