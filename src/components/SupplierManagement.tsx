
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Building, 
  Phone, 
  Mail,
  MapPin,
  DollarSign,
  Package,
  Calendar,
  Edit,
  Trash2,
  Eye,
  AlertCircle
} from 'lucide-react';
import SupplierForm from './SupplierForm';

interface SupplierManagementProps {
  isUrdu: boolean;
}

const SupplierManagement: React.FC<SupplierManagementProps> = ({ isUrdu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      companyName: 'PharmaCorp Ltd',
      contactPerson: 'Mr. Hassan Ali',
      phone: '+92-21-34567890',
      email: 'hassan@pharmacorp.com',
      address: 'Industrial Area, Karachi',
      taxId: 'NTN-1234567',
      totalPurchases: 2500000.00,
      pendingPayments: 125000.00,
      lastOrder: '2024-12-08',
      status: 'active',
      purchases: [
        { date: '2024-12-08', amount: 125000.00, items: 'Antibiotics, Pain killers', invoice: 'INV-001' },
        { date: '2024-11-25', amount: 85000.00, items: 'Vitamins, Syrups', invoice: 'INV-002' }
      ]
    },
    {
      id: 2,
      companyName: 'MediSupply Solutions',
      contactPerson: 'Ms. Ayesha Khan',
      phone: '+92-42-87654321',
      email: 'ayesha@medisupply.com',
      address: 'Medical Complex, Lahore',
      taxId: 'NTN-7654321',
      totalPurchases: 1850000.00,
      pendingPayments: 0.00,
      lastOrder: '2024-12-06',
      status: 'active',
      purchases: [
        { date: '2024-12-06', amount: 95000.00, items: 'Surgical supplies', invoice: 'INV-003' }
      ]
    }
  ]);

  const text = {
    en: {
      title: 'Supplier Management',
      searchPlaceholder: 'Search suppliers...',
      addSupplier: 'Add Supplier',
      supplierProfile: 'Supplier Profile',
      purchaseHistory: 'Purchase History',
      outstandingDues: 'Outstanding Dues',
      companyName: 'Company Name',
      contactPerson: 'Contact Person',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      taxId: 'Tax ID',
      totalPurchases: 'Total Purchases',
      pendingPayments: 'Pending Payments',
      lastOrder: 'Last Order',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View'
    },
    ur: {
      title: 'سپلائر منیجمنٹ',
      searchPlaceholder: 'سپلائر تلاش کریں...',
      addSupplier: 'سپلائر شامل کریں',
      supplierProfile: 'سپلائر پروفائل',
      purchaseHistory: 'خریداری کی تاریخ',
      outstandingDues: 'باقی واجبات',
      companyName: 'کمپنی کا نام',
      contactPerson: 'رابطہ کار',
      phone: 'فون',
      email: 'ای میل',
      address: 'پتہ',
      taxId: 'ٹیکس آئی ڈی',
      totalPurchases: 'کل خریداری',
      pendingPayments: 'بقایا ادائیگیاں',
      lastOrder: 'آخری آرڈر',
      status: 'حالت',
      active: 'فعال',
      inactive: 'غیر فعال',
      edit: 'تبدیل کریں',
      delete: 'حذف کریں',
      view: 'دیکھیں'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.includes(searchTerm)
  );

  const handleSaveSupplier = (supplierData: any) => {
    if (editingSupplier) {
      setSuppliers(suppliers.map(s => s.id === supplierData.id ? supplierData : s));
    } else {
      setSuppliers([...suppliers, supplierData]);
    }
    setEditingSupplier(null);
  };

  const handleEditSupplier = (supplier: any) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleDeleteSupplier = (supplierId: number) => {
    setSuppliers(suppliers.filter(s => s.id !== supplierId));
    if (selectedSupplier?.id === supplierId) {
      setSelectedSupplier(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t.addSupplier}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id} className="cursor-pointer hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Building className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{supplier.companyName}</h3>
                          <p className="text-sm text-gray-600">{supplier.contactPerson}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{supplier.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{supplier.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{supplier.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{t.lastOrder}: {supplier.lastOrder}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-4">
                        <Badge variant="secondary">
                          {t.totalPurchases}: PKR {supplier.totalPurchases.toLocaleString()}
                        </Badge>
                        {supplier.pendingPayments > 0 ? (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Due: PKR {supplier.pendingPayments.toLocaleString()}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Paid</Badge>
                        )}
                        <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                          {supplier.status === 'active' ? t.active : t.inactive}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedSupplier(supplier)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditSupplier(supplier)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteSupplier(supplier.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {selectedSupplier && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t.supplierProfile}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="profile">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="history">Orders</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="profile" className="space-y-4">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building className="h-10 w-10 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-lg">{selectedSupplier.companyName}</h3>
                      <p className="text-sm text-gray-600">{selectedSupplier.contactPerson}</p>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <label className="font-medium">{t.phone}:</label>
                        <p>{selectedSupplier.phone}</p>
                      </div>
                      <div>
                        <label className="font-medium">{t.email}:</label>
                        <p>{selectedSupplier.email}</p>
                      </div>
                      <div>
                        <label className="font-medium">{t.address}:</label>
                        <p>{selectedSupplier.address}</p>
                      </div>
                      <div>
                        <label className="font-medium">{t.taxId}:</label>
                        <p>{selectedSupplier.taxId}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history">
                    <div className="space-y-3">
                      {selectedSupplier.purchases.map((purchase: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">PKR {purchase.amount.toLocaleString()}</p>
                              <p className="text-xs text-gray-600">{purchase.items}</p>
                              <p className="text-xs text-blue-600">{purchase.invoice}</p>
                            </div>
                            <p className="text-xs text-gray-500">{purchase.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {showForm && (
        <SupplierForm
          isUrdu={isUrdu}
          onClose={() => {
            setShowForm(false);
            setEditingSupplier(null);
          }}
          onSave={handleSaveSupplier}
          supplier={editingSupplier}
        />
      )}
    </div>
  );
};

export default SupplierManagement;
