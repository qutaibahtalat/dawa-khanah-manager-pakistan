
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  User, 
  Phone, 
  Mail,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import CustomerForm from './CustomerForm';

interface CustomerManagementProps {
  isUrdu: boolean;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ isUrdu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'Ahmad Hassan',
      phone: '+92-300-1234567',
      email: 'ahmad.hassan@gmail.com',
      address: 'House 123, Block A, Gulshan-e-Iqbal, Karachi',
      cnic: '42101-1234567-1',
      notes: 'Regular customer, prefers generic medicines',
      createdAt: '2023-01-15'
    },
    {
      id: 2,
      name: 'Fatima Khan',
      phone: '+92-321-9876543',
      email: 'fatima.khan@yahoo.com',
      address: 'Flat 45, North Nazimabad, Karachi',
      cnic: '42101-9876543-2',
      notes: 'Diabetic patient, regular insulin purchases',
      createdAt: '2023-02-20'
    }
  ]);

  const text = {
    en: {
      title: 'Customer Management',
      searchPlaceholder: 'Search customers...',
      addCustomer: 'Add Customer',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      cnic: 'CNIC',
      notes: 'Notes',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      customerSince: 'Customer Since'
    },
    ur: {
      title: 'کسٹمر منیجمنٹ',
      searchPlaceholder: 'کسٹمر تلاش کریں...',
      addCustomer: 'کسٹمر شامل کریں',
      name: 'نام',
      phone: 'فون',
      email: 'ای میل',
      address: 'پتہ',
      cnic: 'شناختی کارڈ',
      notes: 'نوٹس',
      edit: 'تبدیل کریں',
      delete: 'حذف کریں',
      view: 'دیکھیں',
      customerSince: 'کسٹمر بننے کی تاریخ'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveCustomer = (customerData: any) => {
    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === customerData.id ? customerData : c));
    } else {
      setCustomers([...customers, customerData]);
    }
    setEditingCustomer(null);
    setShowForm(false);
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDeleteCustomer = (customerId: number) => {
    setCustomers(customers.filter(c => c.id !== customerId));
    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <Button onClick={() => setShowForm(true)}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.cnic}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
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
                  <span>{t.customerSince}: {customer.createdAt}</span>
                </div>
              </div>

              {customer.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                  <strong>{t.notes}:</strong> {customer.notes}
                </div>
              )}

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className="text-xs text-gray-500">ID: {customer.id}</span>
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline" onClick={() => setSelectedCustomer(customer)}>
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEditCustomer(customer)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteCustomer(customer.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm && (
        <CustomerForm
          isUrdu={isUrdu}
          onClose={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
          onSave={handleSaveCustomer}
          customer={editingCustomer}
        />
      )}
    </div>
  );
};

export default CustomerManagement;
