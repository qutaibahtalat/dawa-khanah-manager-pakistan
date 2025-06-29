
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users,
  Download,
  Calendar,
  Filter,
  Loader2
} from 'lucide-react';
import { reportExporter } from '@/utils/reportExporter';
import { toast } from '@/components/ui/use-toast';

interface EnhancedReportsProps {
  isUrdu: boolean;
}

const EnhancedReports: React.FC<EnhancedReportsProps> = ({ isUrdu }) => {
  const [dateRange, setDateRange] = useState({ from: '2024-12-01', to: '2024-12-31' });
  const [isExporting, setIsExporting] = useState(false);

  const text = {
    en: {
      title: 'Enhanced Reports & Analytics',
      salesReport: 'Sales Report',
      inventoryReport: 'Inventory Report',
      profitAnalysis: 'Profit Analysis',
      customerAnalysis: 'Customer Analysis',
      exportPDF: 'Export PDF',
      exportExcel: 'Export Excel',
      totalSales: 'Total Sales',
      totalProfit: 'Total Profit',
      topProducts: 'Top Products',
      activeCustomers: 'Active Customers',
      dailySales: 'Daily Sales',
      monthlySales: 'Monthly Sales',
      categoryWise: 'Category-wise Sales',
      lowStock: 'Low Stock Items'
    },
    ur: {
      title: 'بہتر رپورٹس اور تجزیات',
      salesReport: 'سیلز رپورٹ',
      inventoryReport: 'انوینٹری رپورٹ',
      profitAnalysis: 'منافع کا تجزیہ',
      customerAnalysis: 'کسٹمر کا تجزیہ',
      exportPDF: 'پی ڈی ایف ایکسپورٹ',
      exportExcel: 'ایکسل ایکسپورٹ',
      totalSales: 'کل فروخت',
      totalProfit: 'کل منافع',
      topProducts: 'ٹاپ پروڈکٹس',
      activeCustomers: 'فعال کسٹمرز',
      dailySales: 'یومیہ فروخت',
      monthlySales: 'ماہانہ فروخت',
      categoryWise: 'کیٹگری کے مطابق فروخت',
      lowStock: 'کم اسٹاک آئٹمز'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Sample data for charts
  const dailySalesData = [
    { date: '01 Dec', sales: 15420, profit: 3850 },
    { date: '02 Dec', sales: 18750, profit: 4680 },
    { date: '03 Dec', sales: 22300, profit: 5580 },
    { date: '04 Dec', sales: 19850, profit: 4960 },
    { date: '05 Dec', sales: 25600, profit: 6400 },
    { date: '06 Dec', sales: 21200, profit: 5300 },
    { date: '07 Dec', sales: 28900, profit: 7220 }
  ];

  const categoryData = [
    { name: 'Analgesics', value: 35, sales: 45000 },
    { name: 'Antibiotics', value: 25, sales: 32000 },
    { name: 'Vitamins', value: 20, sales: 25000 },
    { name: 'Antacids', value: 10, sales: 15000 },
    { name: 'Others', value: 10, sales: 12000 }
  ];

  const topProducts = [
    { name: 'Panadol Extra', sales: 450, revenue: 15750 },
    { name: 'Augmentin 625mg', sales: 180, revenue: 81000 },
    { name: 'Brufen 400mg', sales: 320, revenue: 19200 },
    { name: 'Disprol Syrup', sales: 275, revenue: 23375 },
    { name: 'Vitamin C', sales: 380, revenue: 9500 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      setIsExporting(true);
      
      // Prepare the export data
      const exportData = {
        title: `Sales_Report_${new Date().toISOString().split('T')[0]}`,
        headers: [
          'Date', 
          'Sales (PKR)', 
          'Profit (PKR)',
          'Category',
          'Top Product',
          'Product Sales'
        ],
        data: dailySalesData.map((day, index) => [
          day.date,
          day.sales.toLocaleString(),
          day.profit.toLocaleString(),
          categoryData[index % categoryData.length]?.name || 'N/A',
          topProducts[0]?.name || 'N/A',
          topProducts[0]?.sales?.toLocaleString() || '0'
        ]),
        metadata: {
          'Report Type': 'Sales Summary Report',
          'Date Range': `${dateRange.from} to ${dateRange.to}`,
          'Total Sales': `PKR ${dailySalesData.reduce((sum, day) => sum + day.sales, 0).toLocaleString()}`,
          'Total Profit': `PKR ${dailySalesData.reduce((sum, day) => sum + day.profit, 0).toLocaleString()}`,
          'Generated At': new Date().toLocaleString(),
          'Branch': 'Main Branch'
        }
      };

      // Call the appropriate export function
      if (type === 'pdf') {
        reportExporter.exportToPDF(exportData);
      } else {
        reportExporter.exportToExcel(exportData);
      }

      // Show success message
      toast({
        title: isUrdu ? 'رپورٹ تیار ہے' : 'Report Ready',
        description: isUrdu 
          ? `رپورٹ کامیابی سے ${type === 'pdf' ? 'پی ڈی ایف' : 'ایکسل'} میں ایکسپورٹ ہو گئی`
          : `Report successfully exported as ${type.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: isUrdu ? 'خرابی' : 'Error',
        description: isUrdu 
          ? 'رپورٹ ایکسپورٹ کرتے وقت خرابی آئی ہے' 
          : 'Failed to export report',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {t.exportPDF}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('excel')}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {t.exportExcel}
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center space-x-4">
        <Calendar className="h-5 w-5 text-gray-400" />
        <Input
          type="date"
          value={dateRange.from}
          onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
          className="w-48"
        />
        <span>to</span>
        <Input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
          className="w-48"
        />
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Apply
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.totalSales}</p>
                <p className="text-2xl font-bold text-green-600">PKR 1,85,420</p>
                <p className="text-xs text-green-500">+12.5% from last month</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.totalProfit}</p>
                <p className="text-2xl font-bold text-blue-600">PKR 46,350</p>
                <p className="text-xs text-blue-500">+8.3% from last month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.topProducts}</p>
                <p className="text-2xl font-bold text-purple-600">1,605</p>
                <p className="text-xs text-purple-500">Items sold</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.activeCustomers}</p>
                <p className="text-2xl font-bold text-orange-600">284</p>
                <p className="text-xs text-orange-500">+15 new this month</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">{t.salesReport}</TabsTrigger>
          <TabsTrigger value="inventory">{t.inventoryReport}</TabsTrigger>
          <TabsTrigger value="profit">{t.profitAnalysis}</TabsTrigger>
          <TabsTrigger value="customers">{t.customerAnalysis}</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.dailySales}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#8884d8" name="Sales (PKR)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.categoryWise}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profit">
          <Card>
            <CardHeader>
              <CardTitle>Sales vs Profit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Sales (PKR)" />
                  <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit (PKR)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topProducts} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" name="Units Sold" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { month: 'Jan', customers: 180 },
                    { month: 'Feb', customers: 195 },
                    { month: 'Mar', customers: 220 },
                    { month: 'Apr', customers: 245 },
                    { month: 'May', customers: 260 },
                    { month: 'Jun', customers: 284 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="customers" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Regular', value: 45 },
                        { name: 'Premium', value: 30 },
                        { name: 'New', value: 25 }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedReports;
