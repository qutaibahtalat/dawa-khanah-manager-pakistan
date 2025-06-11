import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp,
  DollarSign,
  Package,
  Users,
  BarChart3
} from 'lucide-react';

interface ReportsProps {
  isUrdu: boolean;
}

const Reports: React.FC<ReportsProps> = ({ isUrdu }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedReport, setSelectedReport] = useState('sales');

  const text = {
    en: {
      title: 'Reports & Analytics',
      salesReport: 'Sales Report',
      inventoryReport: 'Inventory Report',
      profitLoss: 'Profit & Loss',
      customerReport: 'Customer Report',
      dateRange: 'Date Range',
      from: 'From',
      to: 'To',
      generateReport: 'Generate Report',
      exportPDF: 'Export PDF',
      exportExcel: 'Export Excel',
      totalSales: 'Total Sales',
      totalProfit: 'Total Profit',
      itemsSold: 'Items Sold',
      transactions: 'Transactions',
      summary: 'Summary',
      details: 'Details'
    },
    ur: {
      title: 'رپورٹس اور تجزیات',
      salesReport: 'سیلز رپورٹ',
      inventoryReport: 'انوینٹری رپورٹ',
      profitLoss: 'منافع و نقصان',
      customerReport: 'کسٹمر رپورٹ',
      dateRange: 'تاریخ کا دورانیہ',
      from: 'سے',
      to: 'تک',
      generateReport: 'رپورٹ بنائیں',
      exportPDF: 'پی ڈی ایف ایکسپورٹ',
      exportExcel: 'ایکسل ایکسپورٹ',
      totalSales: 'کل سیلز',
      totalProfit: 'کل منافع',
      itemsSold: 'فروخت شدہ اشیاء',
      transactions: 'لین دین',
      summary: 'خلاصہ',
      details: 'تفصیلات'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Sample report data
  const salesData = {
    totalSales: 156750,
    totalProfit: 47850,
    itemsSold: 1240,
    transactions: 98
  };

  const recentSales = [
    { id: 1, date: '2024-06-11', medicine: 'Panadol Extra', quantity: 5, amount: 175, profit: 50 },
    { id: 2, date: '2024-06-11', medicine: 'Augmentin 625mg', quantity: 2, amount: 900, profit: 200 },
    { id: 3, date: '2024-06-10', medicine: 'Brufen 400mg', quantity: 8, amount: 480, profit: 120 },
    { id: 4, date: '2024-06-10', medicine: 'Disprol Syrup', quantity: 3, amount: 255, profit: 60 }
  ];

  const inventoryData = [
    { medicine: 'Panadol Extra', stock: 150, value: 3750, status: 'Good' },
    { medicine: 'Augmentin 625mg', stock: 15, value: 5250, status: 'Low' },
    { medicine: 'Brufen 400mg', stock: 0, value: 0, status: 'Out' },
    { medicine: 'Vitamin C', stock: 50, value: 750, status: 'Expiring' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t.exportPDF}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t.exportExcel}
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>{t.dateRange}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">{t.from}</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">{t.to}</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              {t.generateReport}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs value={selectedReport} onValueChange={setSelectedReport}>
        <TabsList>
          <TabsTrigger value="sales">{t.salesReport}</TabsTrigger>
          <TabsTrigger value="inventory">{t.inventoryReport}</TabsTrigger>
          <TabsTrigger value="profit">{t.profitLoss}</TabsTrigger>
          <TabsTrigger value="customer">{t.customerReport}</TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="sales" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{t.totalSales}</p>
                    <p className="text-2xl font-bold text-blue-600">
                      PKR {salesData.totalSales.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{t.totalProfit}</p>
                    <p className="text-2xl font-bold text-green-600">
                      PKR {salesData.totalProfit.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{t.itemsSold}</p>
                    <p className="text-2xl font-bold text-purple-600">{salesData.itemsSold}</p>
                  </div>
                  <Package className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{t.transactions}</p>
                    <p className="text-2xl font-bold text-orange-600">{salesData.transactions}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t.details}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Medicine</th>
                      <th className="text-left p-2">Quantity</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map((sale) => (
                      <tr key={sale.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{sale.date}</td>
                        <td className="p-2 font-medium">{sale.medicine}</td>
                        <td className="p-2">{sale.quantity}</td>
                        <td className="p-2 text-green-600">PKR {sale.amount}</td>
                        <td className="p-2 text-blue-600">PKR {sale.profit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Report */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.inventoryReport}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Medicine</th>
                      <th className="text-left p-2">Stock</th>
                      <th className="text-left p-2">Value</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{item.medicine}</td>
                        <td className="p-2">{item.stock}</td>
                        <td className="p-2">PKR {item.value}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.status === 'Good' ? 'bg-green-100 text-green-800' :
                            item.status === 'Low' ? 'bg-yellow-100 text-yellow-800' :
                            item.status === 'Out' ? 'bg-red-100 text-red-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would follow similar patterns */}
        <TabsContent value="profit">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-600">{t.profitLoss} report coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-600">{t.customerReport} coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
