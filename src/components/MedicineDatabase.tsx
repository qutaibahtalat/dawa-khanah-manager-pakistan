
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { generateMedicineDatabase } from '../utils/medicineDatabase';
import { initializeDatabase } from '../utils/databaseSeeder';
import { Search, Package, Database, Download, RefreshCw } from 'lucide-react';

interface MedicineDatabaseProps {
  isUrdu: boolean;
}

const MedicineDatabase: React.FC<MedicineDatabaseProps> = ({ isUrdu }) => {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  const text = {
    en: {
      title: '20K Medicine Database',
      searchPlaceholder: 'Search medicines by name, generic name, or manufacturer...',
      loadDatabase: 'Load Full Database',
      initializeData: 'Initialize Complete Data',
      exportData: 'Export to CSV',
      totalMedicines: 'Total Medicines',
      name: 'Name',
      genericName: 'Generic Name',
      manufacturer: 'Manufacturer',
      category: 'Category',
      price: 'Price',
      stock: 'Stock',
      loading: 'Loading...',
      noResults: 'No medicines found',
      page: 'Page'
    },
    ur: {
      title: '20 ہزار ادویات کا ڈیٹابیس',
      searchPlaceholder: 'نام، جنرک نام، یا کمپنی سے تلاش کریں...',
      loadDatabase: 'مکمل ڈیٹابیس لوڈ کریں',
      initializeData: 'مکمل ڈیٹا شروع کریں',
      exportData: 'CSV میں ایکسپورٹ',
      totalMedicines: 'کل ادویات',
      name: 'نام',
      genericName: 'جنرک نام',
      manufacturer: 'کمپنی',
      category: 'قسم',
      price: 'قیمت',
      stock: 'اسٹاک',
      loading: 'لوڈ ہو رہا ہے...',
      noResults: 'کوئی دوا نہیں ملی',
      page: 'صفحہ'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  const loadMedicineDatabase = async () => {
    setLoading(true);
    try {
      const medicineData = generateMedicineDatabase(20000);
      setMedicines(medicineData);
      localStorage.setItem('medicine_database', JSON.stringify(medicineData));
      console.log('Loaded 20,000 medicines successfully');
    } catch (error) {
      console.error('Error loading medicine database:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeCompleteDatabase = async () => {
    setLoading(true);
    try {
      await initializeDatabase();
      // Load medicines from localStorage after seeding
      const storedMedicines = localStorage.getItem('pharmacy_medicines');
      if (storedMedicines) {
        setMedicines(JSON.parse(storedMedicines));
      }
      console.log('Complete database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (medicines.length === 0) return;

    const headers = ['Name', 'Generic Name', 'Manufacturer', 'Category', 'Purchase Price', 'Sale Price', 'Stock', 'Barcode'];
    const csvContent = [
      headers.join(','),
      ...medicines.map(med => [
        med.name,
        med.genericName,
        med.manufacturer,
        med.category,
        med.purchasePrice,
        med.salePrice,
        med.stock,
        med.barcode
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'medicine_database.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Load existing data on component mount
  useEffect(() => {
    const storedMedicines = localStorage.getItem('medicine_database') || localStorage.getItem('pharmacy_medicines');
    if (storedMedicines) {
      setMedicines(JSON.parse(storedMedicines));
    }
  }, []);

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMedicines = filteredMedicines.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <div className="flex space-x-2">
          <Button onClick={loadMedicineDatabase} disabled={loading}>
            <Database className="h-4 w-4 mr-2" />
            {t.loadDatabase}
          </Button>
          <Button onClick={initializeCompleteDatabase} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t.initializeData}
          </Button>
          <Button onClick={exportToCSV} disabled={medicines.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            {t.exportData}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{medicines.length.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{t.totalMedicines}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>{t.loading}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Medicine List */}
          <div className="grid grid-cols-1 gap-4">
            {paginatedMedicines.length > 0 ? (
              paginatedMedicines.map((medicine) => (
                <Card key={medicine.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <h3 className="font-semibold text-lg">{medicine.name}</h3>
                        <p className="text-sm text-gray-600">{medicine.genericName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{medicine.manufacturer}</p>
                        <p className="text-xs text-gray-500">{t.manufacturer}</p>
                      </div>
                      <div>
                        <Badge variant="outline">{medicine.category}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">PKR {medicine.salePrice}</p>
                        <p className="text-xs text-gray-500">{t.price}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{medicine.stock}</p>
                        <p className="text-xs text-gray-500">{t.stock}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">{t.noResults}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                {t.page} {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MedicineDatabase;
