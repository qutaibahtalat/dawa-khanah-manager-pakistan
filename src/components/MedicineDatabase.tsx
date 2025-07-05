import React, { useState, useEffect } from 'react';
import { Search, Download, Upload, Filter, BarChart3, AlertTriangle, Package, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { medicineServiceBackend } from '@/services/medicineService.backend';
import { Medicine } from '@/types/medicine';
import { reportExporter } from '../utils/reportExporter';
import commonPakistaniMedicines from '@/data/commonPakistaniMedicines';

interface MedicineDatabaseProps {
  isUrdu: boolean;
}

const MedicineDatabase: React.FC<MedicineDatabaseProps> = ({ isUrdu }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const text = {
    title: isUrdu ? 'دوائیں کا ڈیٹابیس' : 'Medicine Database',
    search: isUrdu ? 'تلاش کریں...' : 'Search medicines...',
    category: isUrdu ? 'کیٹگری' : 'Category',
    all: isUrdu ? 'تمام' : 'All',
    lowStock: isUrdu ? 'کم اسٹاک' : 'Low Stock',
    expiring: isUrdu ? 'ختم ہونے والی' : 'Expiring Soon',
    export: isUrdu ? 'ایکسپورٹ' : 'Export',
    import: isUrdu ? 'امپورٹ' : 'Import',
    generate: isUrdu ? 'ڈیٹابیس بنائیں' : 'Generate Database',
    name: isUrdu ? 'نام' : 'Name',
    generic: isUrdu ? 'جینرک' : 'Generic',
    manufacturer: isUrdu ? 'بنانے والا' : 'Manufacturer',
    batch: isUrdu ? 'بیچ' : 'Batch',
    expiry: isUrdu ? 'ختم ہونے کی تاریخ' : 'Expiry Date',
    stock: isUrdu ? 'اسٹاک' : 'Stock',
    price: isUrdu ? 'قیمت' : 'Price',
    status: isUrdu ? 'حالت' : 'Status',
    inStock: isUrdu ? 'دستیاب' : 'In Stock',
    outOfStock: isUrdu ? 'ختم' : 'Out of Stock'
  };

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      try {
        const meds = await medicineServiceBackend.getAll();
        setMedicines(meds);
        setFilteredMedicines(meds);
      } catch (e) {
        setMedicines([]);
        setFilteredMedicines([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (searchTerm || selectedCategory !== 'all') {
      let results = medicines;
      
      if (searchTerm) {
        results = searchMedicines(results, searchTerm);
      }
      
      if (selectedCategory !== 'all') {
        results = results.filter(med => med.category === selectedCategory);
      }
      
      setFilteredMedicines(results.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ));
    } else {
      setFilteredMedicines(medicines.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ));
    }
  }, [searchTerm, selectedCategory, currentPage, medicines]);

  const generateDatabase = () => {
    try {
      // Generate a smaller, more manageable number of medicines
      const newDatabase = generateMedicineDatabase(1000); // Reduced from 20k to 1k medicines
      setMedicines(newDatabase);
      
      // Try to save to localStorage, but handle potential quota exceeded error
      try {
        localStorage.setItem('medicine_database', JSON.stringify(newDatabase));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          // If we exceed quota, clear old data and try again with half the size
          localStorage.removeItem('medicine_database');
          const smallerDatabase = generateMedicineDatabase(500);
          localStorage.setItem('medicine_database', JSON.stringify(smallerDatabase));
          setMedicines(smallerDatabase);
        } else {
          throw error; // Re-throw if it's a different error
        }
      }
    } catch (error) {
      console.error('Error generating database:', error);
      alert(isUrdu 
        ? 'ڈیٹا بیس بنانے میں خرابی: ' + error.message 
        : 'Error generating database: ' + error.message);
    }
  };
  
  const clearDatabase = () => {
    if (window.confirm(isUrdu 
      ? 'کیا آپ واقعی ڈیٹا بیس کو صاف کرنا چاہتے ہیں؟' 
      : 'Are you sure you want to clear the database?')) {
      localStorage.removeItem('medicine_database');
      setMedicines([]);
      setFilteredMedicines([]);
    }
  };

  const handleExport = () => {
    const exportData = reportExporter.exportInventoryReport(filteredMedicines);
    reportExporter.exportToExcel(exportData);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Handle file import (simplified for demo)
        console.log('Importing file:', file.name);
      }
    };
    input.click();
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: text.outOfStock, color: 'destructive' };
    if (quantity <= 20) return { label: text.lowStock, color: 'secondary' };
    return { label: text.inStock, color: 'default' };
  };

  const categories = [
    'Analgesic', 'Antibiotic', 'Antacid', 'Antihistamine', 'Antidepressant',
    'Antidiabetic', 'Antihypertensive', 'Antiviral', 'Antiseptic', 'Antipyretic'
  ];

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{isUrdu ? 'لوڈ ہو رہا ہے...' : 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{text.title}</h1>
        <div className="flex gap-2">
          <Button 
            onClick={generateDatabase} 
            variant="outline"
            className="mr-2"
          >
            <Package className="h-4 w-4 mr-2" />
            {text.generate}
          </Button>
          <Button 
            onClick={clearDatabase} 
            variant="outline" 
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isUrdu ? 'ڈیٹا بیس صاف کریں' : 'Clear Database'}
          </Button>
          <Button onClick={handleImport} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            {text.import}
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {text.export}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{isUrdu ? 'کل دوائیں' : 'Total Medicines'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicines.length.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{text.lowStock}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {getLowStockMedicines(medicines, 50).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{text.expiring}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {getExpiringMedicines(medicines, 90).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{isUrdu ? 'کل قیمت' : 'Total Value'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              PKR {medicines.reduce((sum, med) => sum + (med.quantity * med.salePrice), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={text.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={text.category} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{text.all}</SelectItem>
                <SelectItem value="low-stock">{text.lowStock}</SelectItem>
                <SelectItem value="expiring">{text.expiring}</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Medicine Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{text.name}</TableHead>
                <TableHead>{text.generic}</TableHead>
                <TableHead>{text.manufacturer}</TableHead>
                <TableHead>{text.batch}</TableHead>
                <TableHead>{text.expiry}</TableHead>
                <TableHead>{text.stock}</TableHead>
                <TableHead>{text.price}</TableHead>
                <TableHead>{text.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicines.map((medicine) => {
                const status = getStockStatus(medicine.quantity);
                const isExpiring = getExpiringMedicines([medicine], 90).length > 0;
                
                return (
                  <TableRow key={medicine.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{medicine.name}</div>
                        {isExpiring && (
                          <div className="flex items-center text-red-500 text-sm mt-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {isUrdu ? 'جلد ختم' : 'Expiring Soon'}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{medicine.genericName}</TableCell>
                    <TableCell>{medicine.manufacturer}</TableCell>
                    <TableCell>{medicine.batchNo}</TableCell>
                    <TableCell>{new Date(medicine.expiryDate).toLocaleDateString()}</TableCell>
                    <TableCell>{medicine.quantity}</TableCell>
                    <TableCell>PKR {medicine.salePrice}</TableCell>
                    <TableCell>
                      <Badge variant={status.color as any}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <Button 
                variant="outline" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                {isUrdu ? 'پچھلا' : 'Previous'}
              </Button>
              <span className="flex items-center px-4">
                {currentPage} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                {isUrdu ? 'اگلا' : 'Next'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicineDatabase;
