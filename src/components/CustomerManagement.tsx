
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  User, 
  Phone, 
  Mail,
  MapPin,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

interface CustomerManagementProps {
  isUrdu: boolean;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ isUrdu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const text = {
    en: {
      title: 'Customer Management',
      searchPlaceholder: 'Search customers...',
      addCustomer: 'Add Customer',
      customerProfile: 'Customer Profile',
      purchaseHistory: 'Purchase History',
      prescriptions: 'Prescriptions',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      cnic: 'CNIC',
      dateOfBirth: 'Date of Birth',
      totalPurchases: 'Total Purchases',
      lastVisit: 'Last Visit',
      loyaltyPoints: 'Loyalty Points',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View'
    },
    ur: {
      title: 'کسٹمر منیجمنٹ',
      searchPlaceholder: 'کسٹمر تلاش کریں...',
      addCustomer: 'کسٹمر شامل کریں',
      customerProfile: 'کسٹمر پروفائل',
      purchaseHistory: 'خریداری کی تاریخ',
      prescriptions: 'نسخے',
      name: 'نام',
      phone: 'فون',
      email: 'ای میل',
      address: 'پتہ',
      cnic: 'شناختی کارڈ',
      dateOfBirth: 'تاریخ پیدائش',
      totalPurchases: 'کل خریداری',
      lastVisit: 'آخری دورہ',
      loyaltyPoints: 'لائلٹی پوائنٹس',
      edit: 'تبدیل کریں',
      delete: 'حذف کریں',
      view: 'دیکھیں'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Sample customer data
  const customers = [
    {
      id: 1,
      name: 'Ahmed Ali',
      phone: '+92-300-1234567',
      email: 'ahmed@email.com',
      address: 'House 123, Street 5, Lahore',
      cnic: '35202-1234567-8',
      dateOfBirth: '1985-05-15',
      totalPurchases: 15420.50,
      lastVisit: '2024-12-10',
      loyaltyPoints: 154,
      purchases: [
        { date: '2024-12-10', amount: 250.00, items: 'Panadol, Augmentin' },
        { date: '2024-11-25', amount: 450.00, items: 'Diabetes medicines' }
      ]
    },
    {
      id: 2,
      name: 'Fatima Khan',
      phone: '+92-301-9876543',
      email: 'fatima@email.com',
      address: 'Flat 45, Block A, Karachi',
      cnic: '42101-9876543-2',
      dateOfBirth: '1990-08-22',
      totalPurchases: 8750.00,
      lastVisit: '2024-12-08',
      loyaltyPoints: 87,
      purchases: [
        { date: '2024-12-08', amount: 180.00, items: 'Vitamins, Pain relief' }
      ]
    }
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.cnic.includes(searchTerm)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t.addCustomer}
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
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="cursor-pointer hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{customer.name}</h3>
                          <p className="text-sm text-gray-600">{customer.cnic}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{customer.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{t.lastVisit}: {customer.lastVisit}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-4">
                        <Badge variant="secondary">
                          {t.totalPurchases}: PKR {customer.totalPurchases.toLocaleString()}
                        </Badge>
                        <Badge variant="outline">
                          {t.loyaltyPoints}: {customer.loyaltyPoints}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedCustomer(customer)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {selectedCustomer && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t.customerProfile}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="profile">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="profile" className="space-y-4">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="h-10 w-10 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-lg">{selectedCustomer.name}</h3>
                      <p className="text-sm text-gray-600">{selectedCustomer.cnic}</p>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <label className="font-medium">{t.phone}:</label>
                        <p>{selectedCustomer.phone}</p>
                      </div>
                      <div>
                        <label className="font-medium">{t.email}:</label>
                        <p>{selectedCustomer.email}</p>
                      </div>
                      <div>
                        <label className="font-medium">{t.address}:</label>
                        <p>{selectedCustomer.address}</p>
                      </div>
                      <div>
                        <label className="font-medium">{t.dateOfBirth}:</label>
                        <p>{selectedCustomer.dateOfBirth}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history">
                    <div className="space-y-3">
                      {selectedCustomer.purchases.map((purchase: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">PKR {purchase.amount}</p>
                              <p className="text-xs text-gray-600">{purchase.items}</p>
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
    </div>
  );
};

export default CustomerManagement;
