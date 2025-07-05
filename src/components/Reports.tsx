import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Download,
  Calendar as CalendarIcon,
  Filter,
  Loader2,
  Search,
  Printer,
  FileText,
  BarChart2,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  DownloadCloud,
  RefreshCw,
  CreditCard
} from 'lucide-react';
import { reportExporter } from '@/utils/reportExporter';
import { toast } from '@/components/ui/use-toast';
import { DateRange } from 'react-day-picker';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, isSameYear, subMonths, startOfYear, endOfYear } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/utils/api';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';

interface ReportData {
  date: string;
  displayDate: string;
  sales: number;
  profit: number;
  purchase: number;
  itemsSold: number;
  category: string;
  supplier: string;
  invoiceNo: string;
  customerName: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface EnhancedReportsProps {
  isUrdu: boolean;
}

const EnhancedReports: React.FC<EnhancedReportsProps> = ({ isUrdu }) => {
  const [dateRange, setDateRange] = useState<{from: string; to: string} | undefined>();
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState('sales');
  const [timeRange, setTimeRange] = useState('30days');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [chartType, setChartType] = useState('bar');
  const [viewMode, setViewMode] = useState('chart');
  const [searchQuery, setSearchQuery] = useState('');
  const [dailySalesData, setDailySalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [topProducts, setTopProducts] = useState([]);

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
      lowStock: 'Low Stock Items',
      print: 'Print',
      selectReportType: 'Select Report Type',
      selectTimeRange: 'Select Time Range',
      last7Days: 'Last 7 Days',
      last30Days: 'Last 30 Days',
      thismonth: 'This Month',
      lastmonth: 'Last Month',
      thisyear: 'This Year',
      custom: 'Custom',
      dateRange: 'Date Range',
      selectDateRange: 'Select Date Range',
      selectSupplier: 'Select Supplier',
      search: 'Search',
      sales: 'Sales',
      purchases: 'Purchases',
      profit: 'Profit'
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
      print: 'پرنٹ',
      selectReportType: 'رپورٹ کی قسم منتخب کریں',
      selectTimeRange: 'تاریخ کا انتخاب کریں',
      last7Days: 'آخری 7 دن',
      last30Days: 'آخری 30 دن',
      thismonth: 'اس ماہ',
      lastmonth: 'پچھلے ماہ',
      thisyear: 'اس سال',
      custom: 'کسٹم',
      dateRange: 'تاریخ کا انتخاب کریں',
      selectDateRange: 'تاریخ کا انتخاب کریں',
      selectSupplier: ' سپلائر منتخب کریں',
      search: 'تلاش',
      sales: 'سیلز',
      purchases: 'خریداری',
      profit: 'منافع'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleExport = async (type: 'pdf' | 'excel' | 'print') => {
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
          'Date Range': `${dateRange?.from} to ${dateRange?.to}`,
          'Total Sales': `PKR ${dailySalesData.reduce((sum, day) => sum + day.sales, 0).toLocaleString()}`,
          'Total Profit': `PKR ${dailySalesData.reduce((sum, day) => sum + day.profit, 0).toLocaleString()}`,
          'Generated At': new Date().toLocaleString(),
          'Branch': 'Main Branch'
        }
      };

      // Call the appropriate export function
      if (type === 'pdf') {
        reportExporter.exportToPDF(exportData);
      } else if (type === 'excel') {
        reportExporter.exportToExcel(exportData);
      } else if (type === 'print') {
        reportExporter.printReport(exportData);
      }

      // Show success message
      toast({
        title: isUrdu ? 'رپورٹ تیار ہے' : 'Report Ready',
        description: isUrdu 
          ? `رپورٹ کامیابی سے ${type === 'pdf' ? 'پی ڈی ایف' : type === 'excel' ? 'ایکسل' : 'پرنٹ'} میں ایکسپورٹ ہو گئی`
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

  const handleTimeRangeChange = (value: string) => {
    const today = new Date();
    let newDateRange: { from: Date; to: Date } | undefined;
    
    switch (value) {
      case '7days':
        newDateRange = { from: subDays(today, 7), to: today };
        break;
      case '30days':
        newDateRange = { from: subDays(today, 30), to: today };
        break;
      case 'thismonth':
        newDateRange = { from: startOfMonth(today), to: endOfMonth(today) };
        break;
      case 'lastmonth':
        newDateRange = { from: startOfMonth(subMonths(today, 1)), to: endOfMonth(subMonths(today, 1)) };
        break;
      case 'thisyear':
        newDateRange = { from: startOfYear(today), to: endOfYear(today) };
        break;
      case 'custom':
        newDateRange = { from: today, to: today };
        break;
      default:
        newDateRange = undefined;
    }
    
    if (newDateRange) {
      setDateRange({
        from: newDateRange.from.toISOString(),
        to: newDateRange.to.toISOString()
      });
    }
    setTimeRange(value);
  };

  const handleDateSelect = (range: {from?: Date; to?: Date} | undefined) => {
    if (!range?.from || !range?.to) return;
    setDateRange({
      from: range.from.toISOString(),
      to: range.to.toISOString()
    });
  };

  const validateFilters = (filters: any) => {
    if (!filters.reportType || !['sales', 'purchases', 'profit'].includes(filters.reportType)) {
      throw new Error('Invalid report type');
    }
    
    if (!filters.dateRange?.from || !filters.dateRange?.to) {
      throw new Error('Date range is required');
    }
    
    const fromDate = new Date(filters.dateRange.from);
    const toDate = new Date(filters.dateRange.to);
    
    if (fromDate > toDate) {
      throw new Error('Invalid date range - start date must be before end date');
    }
    
    return {
      ...filters,
      from: fromDate.toISOString(),
      to: toDate.toISOString()
    };
  };

  const fetchReportData = async (filters: any) => {
    try {
      setIsLoading(true);
      
      // Validate filters
      const validatedFilters = validateFilters(filters);
      
      // Construct API query based on filters
      const query = {
        reportType: validatedFilters.reportType,
        dateRange: {
          from: validatedFilters.from,
          to: validatedFilters.to
        },
        supplier: validatedFilters.supplier,
        searchQuery: validatedFilters.searchQuery,
        timeRange: validatedFilters.timeRange
      };
      
      // Call API to get report data
      const response = await api.get('/api/reports', {
        params: query
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      
      const data = await response.json();
      
      // Update state with fetched data
      setDailySalesData(data.dailySales);
      setCategoryData(data.categories);
      setTotalSales(data.totals.sales);
      setTotalProfit(data.totals.profit);
      setTopProducts(data.totals.topProducts);
      
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch report data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processDataForCharts = (data: any[], type: string) => {
    // Group data by date for daily summaries
    const dailyData = data.reduce((acc, item) => {
      const date = new Date(item.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          displayDate: format(new Date(item.date), 'dd MMM'),
          sales: 0,
          profit: 0,
          purchase: 0,
          itemsSold: 0
        };
      }
      
      acc[date].sales += type === 'sales' ? item.total : 0;
      acc[date].profit += type === 'profit' ? item.profit : 0;
      acc[date].purchase += type === 'purchases' ? item.total : 0;
      acc[date].itemsSold += item.quantity || 0;
      
      return acc;
    }, {});

    // Convert to array and sort by date
    const sortedData = Object.values(dailyData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Prepare category data for pie charts
    const categoryData = type === 'sales' 
      ? data.reduce((acc, item) => {
          const category = item.category || 'Other';
          if (!acc[category]) {
            acc[category] = { name: category, value: 0 };
          }
          acc[category].value += item.total;
          return acc;
        }, {})
      : {};

    return {
      dailyData: sortedData,
      categoryData: Object.values(categoryData),
      topProducts: data
        .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
        .slice(0, 5)
    };
  };

  const fetchSalesData = async () => {
    try {
      const response = await api.get('/pos/orders', {
        params: {
          from: dateRange?.from,
          to: dateRange?.to
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales data:', error);
      throw error;
    }
  };

  const fetchPurchaseData = async () => {
    try {
      const response = await api.get('/inventory/purchases', {
        params: {
          from: dateRange?.from,
          to: dateRange?.to
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase data:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Construct API query based on filters
        const query = {
          reportType,
          dateRange,
          supplier: supplierFilter,
          searchQuery,
          timeRange
        };
        
        // Call API to get report data
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(query)
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch report data');
        }
        
        const data = await response.json();
        
        // Update state with fetched data
        setDailySalesData(data.dailySales);
        setCategoryData(data.categories);
        setTotalSales(data.totals.sales);
        setTotalProfit(data.totals.profit);
        setTopProducts(data.totals.topProducts);
        
      } catch (error) {
        toast({
          title: isUrdu ? 'خرابی' : 'Error',
          description: isUrdu 
            ? 'رپورٹ ڈیٹا حاصل کرنے میں ناکامی' 
            : 'Failed to fetch report data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [reportType, dateRange, supplierFilter, searchQuery, timeRange, isUrdu]);

  useEffect(() => {
    if (reportType && dateRange) {
      fetchReportData({ reportType, dateRange });
    }
  }, [reportType, dateRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(isUrdu ? 'ur-PK' : 'en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatTooltipValue = (value: number) => {
    return formatCurrency(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-1/3" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        
        <Skeleton className="h-64 w-full" />
        
        <div className="rounded-md border">
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header and Export Buttons */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <div className="flex gap-2">
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
          <Button 
            variant="outline" 
            onClick={() => handleExport('print')}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            {t.print}
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Report Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.selectReportType}</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t.selectReportType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">{t.sales}</SelectItem>
              <SelectItem value="purchases">{t.purchases}</SelectItem>
              <SelectItem value="profit">{t.profit}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Range Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.selectTimeRange}</label>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t.selectTimeRange} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">{t.last7Days}</SelectItem>
              <SelectItem value="30days">{t.last30Days}</SelectItem>
              <SelectItem value="thismonth">{t.thismonth}</SelectItem>
              <SelectItem value="lastmonth">{t.lastmonth}</SelectItem>
              <SelectItem value="thisyear">{t.thisyear}</SelectItem>
              <SelectItem value="custom">{t.custom}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.dateRange}</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    `${format(new Date(dateRange.from), 'dd MMM yyyy')} - ${format(new Date(dateRange.to), 'dd MMM yyyy')}`
                  ) : (
                    format(new Date(dateRange.from), 'dd MMM yyyy')
                  )
                ) : (
                  <span>{t.selectDateRange}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="range"
                selected={dateRange ? {from: new Date(dateRange.from), to: new Date(dateRange.to)} : undefined}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Supplier Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.selectSupplier}</label>
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t.selectSupplier} />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder={t.search}
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center space-x-4">
        <CalendarIcon className="h-5 w-5 text-gray-400" />
        <Input
          type="date"
          value={dateRange?.from}
          onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
          className="w-48"
        />
        <span>to</span>
        <Input
          type="date"
          value={dateRange?.to}
          onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
          className="w-48"
        />
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Apply
        </Button>
      </div>

      {/* View Toggle */}
      <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chart">
            <BarChart2 className="h-4 w-4 mr-2" />
            {isUrdu ? 'چارٹ' : 'Charts'}
          </TabsTrigger>
          <TabsTrigger value="table">
            <Table className="h-4 w-4 mr-2" />
            {isUrdu ? 'ٹیبل' : 'Table'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart">
          {/* Data Visualization Section */}
          <div className="grid grid-cols-1 gap-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t.totalSales}
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(totalSales)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.dailySales}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t.totalProfit}
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(totalProfit)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.monthlySales}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t.topProducts}
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {topProducts.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.categoryWise}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>{t[reportType]}</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailySalesData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatTooltipValue(value)}
                      />
                      <Tooltip 
                        formatter={(value) => formatTooltipValue(value)}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Bar 
                        dataKey="sales" 
                        fill="#8884d8" 
                        name={t[reportType]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Category Distribution */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>{t.categoryWise}</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatTooltipValue(value)}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{t.totalSales}</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSales)}</p>
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
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalProfit)}</p>
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
                    <p className="text-2xl font-bold text-purple-600">{topProducts.length}</p>
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
        </TabsContent>
        
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>{t[reportType]}</CardTitle>
              <CardDescription>
                {dateRange?.from && dateRange?.to 
                  ? `${format(new Date(dateRange.from), 'dd MMM yyyy')} - ${format(new Date(dateRange.to), 'dd MMM yyyy')}`
                  : t.selectDateRange}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isUrdu ? 'تاریخ' : 'Date'}</TableHead>
                      <TableHead className="text-right">{isUrdu ? 'سیلز' : 'Sales'}</TableHead>
                      <TableHead className="text-right">{isUrdu ? 'منافع' : 'Profit'}</TableHead>
                      {reportType === 'purchases' && (
                        <TableHead className="text-right">{isUrdu ? 'سپلائر' : 'Supplier'}</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailySalesData.map((item) => (
                      <TableRow key={item.date}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.sales)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.profit)}</TableCell>
                        {reportType === 'purchases' && (
                          <TableCell className="text-right">{item.supplier}</TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedReports;
