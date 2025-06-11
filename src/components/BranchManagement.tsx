
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  MapPin, 
  Phone, 
  Mail,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  Building
} from 'lucide-react';

interface BranchManagementProps {
  isUrdu: boolean;
}

const BranchManagement: React.FC<BranchManagementProps> = ({ isUrdu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  const text = {
    en: {
      title: 'Branch Management',
      searchPlaceholder: 'Search branches...',
      addBranch: 'Add Branch',
      branchDetails: 'Branch Details',
      performance: 'Performance',
      staff: 'Staff',
      branchName: 'Branch Name',
      manager: 'Manager',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      totalSales: 'Total Sales',
      totalStaff: 'Total Staff',
      inventory: 'Inventory Items',
      monthlyTarget: 'Monthly Target',
      achievement: 'Achievement',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View'
    },
    ur: {
      title: 'برانچ منیجمنٹ',
      searchPlaceholder: 'برانچ تلاش کریں...',
      addBranch: 'برانچ شامل کریں',
      branchDetails: 'برانچ کی تفصیلات',
      performance: 'کارکردگی',
      staff: 'عملہ',
      branchName: 'برانچ کا نام',
      manager: 'منیجر',
      phone: 'فون',
      email: 'ای میل',
      address: 'پتہ',
      totalSales: 'کل سیلز',
      totalStaff: 'کل عملہ',
      inventory: 'انوینٹری آئٹمز',
      monthlyTarget: 'ماہانہ ہدف',
      achievement: 'کامیابی',
      status: 'حالت',
      active: 'فعال',
      inactive: 'غیر فعال',
      edit: 'تبدیل کریں',
      delete: 'حذف کریں',
      view: 'دیکھیں'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Sample branch data
  const branches = [
    {
      id: 1,
      name: 'Main Branch - Gulberg',
      manager: 'Dr. Ali Hassan',
      phone: '+92-42-35678901',
      email: 'gulberg@pharmacy.com',
      address: 'Plot 123, Main Boulevard, Gulberg III, Lahore',
      totalSales: 2500000.00,
      totalStaff: 12,
      inventoryItems: 8500,
      monthlyTarget: 300000.00,
      achievement: 85.5,
      status: 'active',
      staff: [
        { name: 'Dr. Ali Hassan', role: 'Manager', phone: '+92-300-1234567' },
        { name: 'Ahmad Raza', role: 'Pharmacist', phone: '+92-301-2345678' },
        { name: 'Fatima Ali', role: 'Sales Assistant', phone: '+92-302-3456789' }
      ]
    },
    {
      id: 2,
      name: 'Branch - DHA Phase 5',
      manager: 'Dr. Sara Khan',
      phone: '+92-42-45678901',
      email: 'dha@pharmacy.com',
      address: 'Commercial Area, DHA Phase 5, Lahore',
      totalSales: 1850000.00,
      totalStaff: 8,
      inventoryItems: 6200,
      monthlyTarget: 200000.00,
      achievement: 92.5,
      status: 'active',
      staff: [
        { name: 'Dr. Sara Khan', role: 'Manager', phone: '+92-300-9876543' },
        { name: 'Hassan Ali', role: 'Pharmacist', phone: '+92-301-8765432' }
      ]
    }
  ];

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t.addBranch}
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
            {filteredBranches.map((branch) => (
              <Card key={branch.id} className="cursor-pointer hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Building className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{branch.name}</h3>
                          <p className="text-sm text-gray-600">{branch.manager}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{branch.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{branch.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{branch.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{t.totalStaff}: {branch.totalStaff}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-green-600">
                            PKR {branch.totalSales.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600">{t.totalSales}</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <Package className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-blue-600">
                            {branch.inventoryItems}
                          </p>
                          <p className="text-xs text-gray-600">{t.inventory}</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-orange-600">
                            {branch.achievement}%
                          </p>
                          <p className="text-xs text-gray-600">{t.achievement}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Badge variant={branch.status === 'active' ? 'default' : 'secondary'}>
                          {branch.status === 'active' ? t.active : t.inactive}
                        </Badge>
                        <Badge variant="outline">
                          Target: PKR {branch.monthlyTarget.toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedBranch(branch)}>
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

        {selectedBranch && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t.branchDetails}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building className="h-10 w-10 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-lg">{selectedBranch.name}</h3>
                      <p className="text-sm text-gray-600">{selectedBranch.manager}</p>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <label className="font-medium">{t.phone}:</label>
                        <p>{selectedBranch.phone}</p>
                      </div>
                      <div>
                        <label className="font-medium">{t.email}:</label>
                        <p>{selectedBranch.email}</p>
                      </div>
                      <div>
                        <label className="font-medium">{t.address}:</label>
                        <p>{selectedBranch.address}</p>
                      </div>
                      <div>
                        <label className="font-medium">{t.monthlyTarget}:</label>
                        <p>PKR {selectedBranch.monthlyTarget.toLocaleString()}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="staff">
                    <div className="space-y-3">
                      {selectedBranch.staff.map((member: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-xs text-gray-600">{member.role}</p>
                              <p className="text-xs text-blue-600">{member.phone}</p>
                            </div>
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

export default BranchManagement;
