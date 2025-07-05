import React, { useState, useEffect } from 'react';
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
  Loader2,
  TrendingDown
} from 'lucide-react';
import { reportExporter } from '@/utils/reportExporter';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fetchRealTimeAnalytics } from '@/services/analyticsService';

interface EnhancedReportsProps {
  isUrdu: boolean;
}

const EnhancedReports: React.FC<EnhancedReportsProps> = ({ isUrdu }) => {
  const [dateRange, setDateRange] = useState({ from: '2024-12-01', to: '2024-12-31' });
  const [isExporting, setIsExporting] = useState(false);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [profitData, setProfitData] = useState<any>({});
  const [filter, setFilter] = useState({
    interval: 'month', // 'day', 'week', 'month', 'year'
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    week: '',
    dateRange: { from: '', to: '' },
    expenseType: 'all',
    minAmount: 0
  });
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExpenseData = () => {
      try {
        const expenses = JSON.parse(localStorage.getItem('pharmacy_expenses') || '[]');
        setExpenseData(expenses);
        
        // Calculate profit (sample calculation - adjust based on your actual sales data)
        const sales = JSON.parse(localStorage.getItem('pharmacy_sales') || '[]');
        const totalRevenue = sales.reduce((sum: number, sale: any) => sum + sale.total, 0);
        const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
        
        setProfitData({
          totalRevenue,
          totalExpenses,
          profit: totalRevenue - totalExpenses
        });
      } catch (err) {
        console.error('Error loading expense data:', err);
      }
    };
    
    loadExpenseData();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchRealTimeAnalytics();
      setAnalytics(data);
      setLoading(false);
    };
    
    loadData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter expenses based on current filters
  const filteredExpenses = expenseData.filter(expense => {
    const matchesDate = !filter.dateRange.from || !filter.dateRange.to || 
      (expense.date >= filter.dateRange.from && expense.date <= filter.dateRange.to);
    const matchesType = filter.expenseType === 'all' || expense.type === filter.expenseType;
    const matchesAmount = expense.amount >= filter.minAmount;
    return matchesDate && matchesType && matchesAmount;
  });

  // Add expense type distribution data
  const expenseTypeData = expenseData.reduce((acc, expense) => {
    const existing = acc.find(item => item.name === expense.type);
    if (existing) {
      existing.value += expense.amount;
    } else {
      acc.push({ name: expense.type, value: expense.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Add expense trend data (monthly)
  const monthlyExpenseData = expenseData.reduce((acc, expense) => {
    const month = expense.date.substring(0, 7); // YYYY-MM
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.amount += expense.amount;
    } else {
      acc.push({ month, amount: expense.amount });
    }
    return acc;
  }, [] as { month: string; amount: number }[]).sort((a, b) => a.month.localeCompare(b.month));

  const text = {
    filterBy: { en: 'Filter By', ur: 'فلٹر کریں' },
    interval: { en: 'Interval', ur: 'وقفہ' },
    day: { en: 'Day', ur: 'دن' },
    week: { en: 'Week', ur: 'ہفتہ' },
    month: { en: 'Month', ur: 'مہینہ' },
    year: { en: 'Year', ur: 'سال' },
    print: { en: 'Print Report', ur: 'رپورٹ پرنٹ کریں' },
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
      lowStock: 'Low Stock Items',
      totalExpenses: 'Total Expenses',
      totalRevenue: 'Total Revenue',
      netProfit: 'Net Profit',
      profitMargin: 'Profit Margin',
      selectStartDate: 'Select Start Date',
      selectEndDate: 'Select End Date'
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
      lowStock: 'کم اسٹاک آئٹمز',
      totalExpenses: 'کل اخراجات',
      totalRevenue: 'کل آمدنی',
      netProfit: 'خالص منافع',
      profitMargin: 'منافع کا تناسب',
      selectStartDate: 'شروع کی تاریخ منتخب کریں',
      selectEndDate: 'آخر کی تاریخ منتخب کریں'
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
        title: `Analytics_Report_${new Date().toISOString().split('T')[0]}`,
        headers: [
          'Date', 
          'Sales (PKR)', 
          'Profit (PKR)', 
          'Top Product', 
          'Top Product Sales',
          'Active Customers'
        ],
        data: dailySalesData.map((day, index) => [
          day.date,
          day.sales.toLocaleString(),
          day.profit.toLocaleString(),
          topProducts[0]?.name || 'N/A',
          topProducts[0]?.sales?.toLocaleString() || '0',
          '284' // Static for this example, could be dynamic
        ]),
        metadata: {
          'Report Type': 'Analytics Summary',
          'Date Range': `${dateRange.from} to ${dateRange.to}`,
          'Total Sales': `PKR ${dailySalesData.reduce((sum, day) => sum + day.sales, 0).toLocaleString()}`,
          'Total Profit': `PKR ${dailySalesData.reduce((sum, day) => sum + day.profit, 0).toLocaleString()}`,
          'Generated At': new Date().toLocaleString(),
          'Branch': 'Main Branch' // Could be dynamic in a real app
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

  // Helper: get filtered analytics data by interval
  function getFilteredAnalytics() {
    if (!analytics || !analytics.salesData) return { sales: [], profit: [], expenses: [] };
    const { salesData, profitData, expenseData: allExpenses } = analytics;
    let filteredSales = salesData;
    let filteredProfit = profitData;
    let filteredExpenses = allExpenses;
    const now = new Date();
    if (filter.interval === 'year') {
      filteredSales = salesData.filter((item: any) => new Date(item.date).getFullYear().toString() === filter.year);
      filteredProfit = profitData.filter((item: any) => new Date(item.date).getFullYear().toString() === filter.year);
      filteredExpenses = allExpenses.filter((item: any) => new Date(item.date).getFullYear().toString() === filter.year);
    } else if (filter.interval === 'month') {
      filteredSales = salesData.filter((item: any) => {
        const d = new Date(item.date);
        return d.getFullYear().toString() === filter.year && (d.getMonth() + 1).toString().padStart(2, '0') === filter.month;
      });
      filteredProfit = profitData.filter((item: any) => {
        const d = new Date(item.date);
        return d.getFullYear().toString() === filter.year && (d.getMonth() + 1).toString().padStart(2, '0') === filter.month;
      });
      filteredExpenses = allExpenses.filter((item: any) => {
        const d = new Date(item.date);
        return d.getFullYear().toString() === filter.year && (d.getMonth() + 1).toString().padStart(2, '0') === filter.month;
      });
    } else if (filter.interval === 'week') {
      // Week filtering (ISO week)
      const getWeek = (date: Date) => {
        const d = new Date(date.getTime());
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return weekNo;
      };
      filteredSales = salesData.filter((item: any) => {
        const d = new Date(item.date);
        return d.getFullYear().toString() === filter.year && getWeek(d).toString() === filter.week;
      });
      filteredProfit = profitData.filter((item: any) => {
        const d = new Date(item.date);
        return d.getFullYear().toString() === filter.year && getWeek(d).toString() === filter.week;
      });
      filteredExpenses = allExpenses.filter((item: any) => {
        const d = new Date(item.date);
        return d.getFullYear().toString() === filter.year && getWeek(d).toString() === filter.week;
      });
    } else if (filter.interval === 'day') {
      filteredSales = salesData.filter((item: any) => new Date(item.date).toISOString().split('T')[0] === filter.dateRange.from);
      filteredProfit = profitData.filter((item: any) => new Date(item.date).toISOString().split('T')[0] === filter.dateRange.from);
      filteredExpenses = allExpenses.filter((item: any) => new Date(item.date).toISOString().split('T')[0] === filter.dateRange.from);
    }
    return { sales: filteredSales, profit: filteredProfit, expenses: filteredExpenses };
  }

  // Generate options for year/month/week
  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const weeks = Array.from({ length: 53 }, (_, i) => (i + 1).toString());

  return (
    <div className="p-6 space-y-6">
      {/* Interval Filter Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <label>{text.filterBy[isUrdu ? 'ur' : 'en']}:</label>
        <Select value={filter.interval} onValueChange={val => setFilter(f => ({ ...f, interval: val }))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder={text.interval[isUrdu ? 'ur' : 'en']} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">{text.day[isUrdu ? 'ur' : 'en']}</SelectItem>
            <SelectItem value="week">{text.week[isUrdu ? 'ur' : 'en']}</SelectItem>
            <SelectItem value="month">{text.month[isUrdu ? 'ur' : 'en']}</SelectItem>
            <SelectItem value="year">{text.year[isUrdu ? 'ur' : 'en']}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter.year} onValueChange={val => setFilter(f => ({ ...f, year: val }))}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder={text.year[isUrdu ? 'ur' : 'en']} />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        {(filter.interval === 'month') && (
          <Select value={filter.month} onValueChange={val => setFilter(f => ({ ...f, month: val }))}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder={text.month[isUrdu ? 'ur' : 'en']} />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {(filter.interval === 'week') && (
          <Select value={filter.week} onValueChange={val => setFilter(f => ({ ...f, week: val }))}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder={text.week[isUrdu ? 'ur' : 'en']} />
            </SelectTrigger>
            <SelectContent>
              {weeks.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {(filter.interval === 'day') && (
          <DatePicker
            selectsMultiple={false}
            selected={filter.dateRange.from ? new Date(filter.dateRange.from) : null}
            onChange={date => setFilter(f => ({ ...f, dateRange: { ...f.dateRange, from: date ? date.toISOString().split('T')[0] : '' } }))}
            dateFormat="yyyy-MM-dd"
            placeholderText={t.selectStartDate}
            className="w-36 p-2 border rounded-md"
            isClearable
          />
        )}
        <Button variant="outline" onClick={() => setFilter({ ...filter })}>
          <Filter className="h-4 w-4 mr-2" />
          Apply
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="h-4 w-4 mr-2" />
          {text.print[isUrdu ? 'ur' : 'en']}
        </Button>
      </div>



      {/* Profit Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">{t.totalRevenue}</p>
                <p className="text-2xl font-bold">
                  {loading ? 'Loading...' : `PKR ${analytics?.totalRevenue?.toLocaleString() || '0'}`}
                </p>
                <p className="text-xs text-green-500">+12.5% from last month</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">{t.totalExpenses}</p>
                <p className="text-2xl font-bold">
                  {loading ? 'Loading...' : `PKR ${analytics?.totalExpenses?.toLocaleString() || '0'}`}
                </p>
                <p className="text-xs text-red-500">+12.5% from last month</p>
              </div>
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">{t.netProfit}</p>
                <p className="text-2xl font-bold">
                  {loading ? 'Loading...' : `PKR ${analytics?.netProfit?.toLocaleString() || '0'}`}
                  <span className={`ml-2 text-sm ${analytics?.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {loading ? '' : `(${analytics?.totalRevenue ? ((analytics?.netProfit / analytics?.totalRevenue) * 100).toFixed(1) : '0'}%)`}
                  </span>
                </p>
              </div>
              {analytics?.netProfit >= 0 ? (
                <TrendingUp className="h-6 w-6 text-blue-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-blue-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">{t.profitMargin}</p>
                <p className="text-2xl font-bold">
                  {loading ? 'Loading...' : `${analytics?.totalRevenue ? ((analytics?.netProfit / analytics?.totalRevenue) * 100).toFixed(1) : '0'}%`}
                </p>
              </div>
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center space-x-4">
        <Calendar className="h-5 w-5 text-gray-400" />
        <DatePicker
          selectsMultiple={false}
          selected={dateRange.from ? new Date(dateRange.from) : null}
          onChange={(date: Date) => setDateRange({...dateRange, from: date ? date.toISOString().split('T')[0] : ''})}
          selectsStart
          startDate={dateRange.from ? new Date(dateRange.from) : null}
          endDate={dateRange.to ? new Date(dateRange.to) : null}
          placeholderText={t.selectStartDate}
          className="w-48 p-2 border rounded-md"
          dateFormat="yyyy-MM-dd"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          isClearable
        />
        <span>to</span>
        <DatePicker
          selectsMultiple={false}
          selected={dateRange.to ? new Date(dateRange.to) : null}
          onChange={(date: Date) => setDateRange({...dateRange, to: date ? date.toISOString().split('T')[0] : ''})}
          selectsEnd
          startDate={dateRange.from ? new Date(dateRange.from) : null}
          endDate={dateRange.to ? new Date(dateRange.to) : null}
          minDate={dateRange.from ? new Date(dateRange.from) : null}
          placeholderText={t.selectEndDate}
          className="w-48 p-2 border rounded-md"
          dateFormat="yyyy-MM-dd"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          isClearable
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
                <p className="text-2xl font-bold text-green-600">
                  {loading ? 'Loading...' : `PKR ${analytics?.totalSales?.toLocaleString() || '0'}`}
                </p>
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
                <p className="text-2xl font-bold text-blue-600">
                  {loading ? 'Loading...' : `PKR ${analytics?.totalProfit?.toLocaleString() || '0'}`}
                </p>
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
                <p className="text-2xl font-bold text-purple-600">
                  {loading ? 'Loading...' : analytics?.topProducts || '0'}
                </p>
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
                <p className="text-2xl font-bold text-orange-600">
                  {loading ? 'Loading...' : analytics?.activeCustomers || '0'}
                </p>
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
                  <LineChart data={getCustomerGrowthData(analytics?.customers)}>
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
                      data={getCustomerSegmentData(analytics?.customers)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {getCustomerSegmentData(analytics?.customers).map((entry, index) => (
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
}

function getCustomerGrowthData(customers: any[] = []) {
  if (!customers || customers.length === 0) return [];
  // Group by month (last 6 months)
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`,
      label: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth() + 1
    });
  }
  const growth = months.map(m => {
    const count = customers.filter(c => {
      const join = c.joinDate || c.createdAt;
      if (!join) return false;
      const d = new Date(join);
      return d.getFullYear() === m.year && d.getMonth() + 1 === m.month;
    }).length;
    return { month: m.label, customers: count };
  });
  return growth;
}

function getCustomerSegmentData(customers: any[] = []) {
  if (!customers || customers.length === 0) return [];
  // Example: classify by totalPurchases or loyaltyPoints
  let regular = 0, premium = 0, newcomer = 0;
  customers.forEach(c => {
    if (c.totalPurchases >= 20 || c.loyaltyPoints >= 1000) premium++;
    else if ((c.joinDate || c.createdAt) && new Date(c.joinDate || c.createdAt) > new Date(new Date().setMonth(new Date().getMonth() - 1))) newcomer++;
    else regular++;
  });
  return [
    { name: 'Regular', value: regular },
    { name: 'Premium', value: premium },
    { name: 'New', value: newcomer }
  ];
}

export default EnhancedReports;
