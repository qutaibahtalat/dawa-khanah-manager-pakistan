import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  ShoppingCart,
  Users,
  Clock,
  RefreshCw
} from 'lucide-react';
import { 
  getTodaySales, 
  getTotalInventory,
  getLowStockItems,
  getMonthlyProfit 
} from '@/utils/dashboardService';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { 
  TrendingUp as TrendingUpIcon, 
  Package as PackageIcon, 
  AlertTriangle as AlertTriangleIcon, 
  ShoppingCart as ShoppingCartIcon,
  Users as UsersIcon,
  Calendar as CalendarIcon2,
  Clock as ClockIcon,
  RefreshCw as RefreshCwIcon
} from 'lucide-react';
import { getRecentSales } from '@/utils/salesService';
import { getInventory } from '@/utils/inventoryService';

interface DashboardProps {
  isUrdu: boolean;
}

interface SaleItem {
  id: string;
  medicine: string;
  customer: string;
  amount: number;
  time: string;
  date: string;
}

interface FormData {
  customerName: string;
  productName: string;
  price: string;
  tax: string;
  discount: string;
  date: Date | undefined;
  time: string;
}

interface DashboardStats {
  todaySales: number;
  totalInventory: number;
  lowStockItems: number;
  monthlyProfit: number;
  isLoading: boolean;
}

// Helper functions for localStorage
const STORAGE_KEY = 'pharmacy_recent_sales';

const saveToLocalStorage = (sales: SaleItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const loadFromLocalStorage = (): SaleItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
};

const Dashboard: React.FC<DashboardProps> = ({ isUrdu }) => {
  const [recentSales, setRecentSales] = useState<SaleItem[]>(() => loadFromLocalStorage());
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    totalInventory: 0,
    lowStockItems: 0,
    monthlyProfit: 0,
    isLoading: true
  });
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Listen for saleCompleted event to update sales in real time
  useEffect(() => {
    const handleSaleCompleted = () => {
      setRecentSales(loadFromLocalStorage());
    };
    window.addEventListener('saleCompleted', handleSaleCompleted);
    return () => {
      window.removeEventListener('saleCompleted', handleSaleCompleted);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setStats(prev => ({...prev, isLoading: true}));
      
      const [sales, inventory, lowStock, profit] = await Promise.all([
        getTodaySales(),
        getTotalInventory(),
        getLowStockItems(),
        getMonthlyProfit()
      ]);

      setStats({
        todaySales: sales,
        totalInventory: inventory,
        lowStockItems: lowStock,
        monthlyProfit: profit,
        isLoading: false
      });
      
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats(prev => ({...prev, isLoading: false}));
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return format(date, 'PPP');
  };

  const text = {
    en: {
      title: 'Dashboard',
      todaysSales: "Today's Sales",
      totalInventory: "Total Inventory",
      lowStock: "Low Stock Items",
      monthlyProfit: "Monthly Profit",
      recentSales: "Recent Sales",
      expiringMedicines: "Expiring Soon",
      topSelling: "Top Selling",
      quickActions: "Quick Actions"
    },
    ur: {
      title: 'ڈیش بورڈ',
      todaysSales: "آج کی سیلز",
      totalInventory: "کل انوینٹری",
      lowStock: "کم اسٹاک",
      monthlyProfit: "ماہانہ منافع",
      recentSales: "حالیہ سیلز",
      expiringMedicines: "ختم ہونے والی",
      topSelling: "زیادہ فروخت",
      quickActions: "فوری اعمال"
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Calculate today's sales based on the provided current local time
  const todayDateString = '2025-07-03'; // Use the provided current local time as the source of truth
  const todaysSales = recentSales
    .filter(sale => {
      // sale.date could be in different formats, so normalize
      if (!sale.date) return false;
      // Accept both ISO and local date strings
      return sale.date.startsWith(todayDateString);
    })
    .reduce((sum, sale) => sum + (sale.amount || 0), 0);

  const statsData = [
    {
      title: t.todaysSales,
      value: stats.todaySales,
      icon: ShoppingCartIcon,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: t.totalInventory,
      value: stats.totalInventory,
      icon: PackageIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: t.lowStock,
      value: stats.lowStockItems,
      icon: AlertTriangleIcon,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: t.monthlyProfit,
      value: stats.monthlyProfit,
      icon: TrendingUpIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  // Load recent sales on component mount and set up refresh functionality
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const loadRecentSales = () => {
    setIsRefreshing(true);
    try {
      const savedSales = getRecentSales();
      setRecentSales(savedSales);
    } catch (error) {
      console.error('Error loading recent sales:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load recent sales on component mount
  React.useEffect(() => {
    loadRecentSales();
  }, []);

  // Real-time expiring medicines state
  const [expiringMedicines, setExpiringMedicines] = useState<{
    id: number;
    medicine: string;
    expiry: string;
    stock: number;
  }[]>([]);

  // Helper: isExpiringSoon (90 days logic)
  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date('2025-07-03T13:25:33+05:00'); // Use provided local time
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    return expiry <= ninetyDaysFromNow;
  };

  // Load expiring medicines from inventory
  React.useEffect(() => {
    const updateExpiring = () => {
      try {
        const inventory = (window as any).getInventory
          ? (window as any).getInventory()
          : require('@/utils/inventoryService').getInventory();
        const expiring = inventory
          .filter((item: any) => isExpiringSoon(item.expiryDate))
          .map((item: any) => ({
            id: item.id,
            medicine: item.name,
            expiry: item.expiryDate,
            stock: item.stock
          }))
          .sort((a: any, b: any) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());
        setExpiringMedicines(expiring);
      } catch (e) {
        setExpiringMedicines([]);
      }
    };
    updateExpiring();
    // Listen for storage changes to update in real-time
    window.addEventListener('storage', updateExpiring);
    return () => window.removeEventListener('storage', updateExpiring);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <CalendarIcon2 className="h-4 w-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4" />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCartIcon className="h-5 w-5" />
                <span>{t.recentSales}</span>
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={loadRecentSales}
                disabled={isRefreshing}
              >
                <RefreshCwIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{sale.medicine}</p>
                      <p className="text-sm text-gray-600">
                        {isUrdu ? 'گاہک:' : 'Customer:'} {sale.customer}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {isUrdu ? 'روپے ' : 'PKR '}
                        {sale.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sale.date} • {sale.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {isUrdu ? 'کوئی حالیہ فروخت نہیں ملی' : 'No recent sales found'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Medicines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangleIcon className="h-5 w-5 text-yellow-600" />
              <span>{t.expiringMedicines}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringMedicines.length > 0 ? (
                expiringMedicines.map((medicine) => (
                  <div key={medicine.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-gray-900">{medicine.medicine}</p>
                      <p className="text-sm text-gray-600">Stock: {medicine.stock}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-yellow-600">
                        Exp: {medicine.expiry}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {isUrdu ? 'کوئی ختم ہونے والی دوا نہیں' : 'No expiring medicines found'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Dashboard Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Today's Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {isUrdu ? 'آج کی فروخت' : "Today's Sales"}
            </CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-2xl font-bold">
                Rs. {stats.todaySales.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Inventory */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {isUrdu ? 'کل انوینٹری' : 'Total Inventory'}
            </CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-2xl font-bold">
                {stats.totalInventory.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {isUrdu ? 'کم اسٹاک اشیاء' : 'Low Stock Items'}
            </CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-2xl font-bold">
                {stats.lowStockItems.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Profit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {isUrdu ? 'ماہانہ منافع' : 'Monthly Profit'}
            </CardTitle>
            <ShoppingCartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-2xl font-bold">
                Rs. {stats.monthlyProfit.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="col-span-full text-right text-sm text-muted-foreground">
          Last updated: {lastUpdated || 'Never'}
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2"
            onClick={fetchDashboardData}
            disabled={stats.isLoading}
          >
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${stats.isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
