
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  Clock
} from 'lucide-react';

interface DashboardProps {
  isUrdu: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isUrdu }) => {
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

  const stats = [
    {
      title: t.todaysSales,
      value: "PKR 45,230",
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: t.totalInventory,
      value: "8,450",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: t.lowStock,
      value: "23",
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: t.monthlyProfit,
      value: "PKR 1,234,567",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const recentSales = [
    { id: 1, medicine: "Panadol Extra", quantity: 2, amount: "PKR 70", time: "10:30 AM" },
    { id: 2, medicine: "Augmentin 625mg", quantity: 1, amount: "PKR 450", time: "10:25 AM" },
    { id: 3, medicine: "Brufen 400mg", quantity: 3, amount: "PKR 180", time: "10:20 AM" },
    { id: 4, medicine: "Disprol Syrup", quantity: 1, amount: "PKR 85", time: "10:15 AM" }
  ];

  const expiringMedicines = [
    { id: 1, medicine: "Vitamin C Tablets", expiry: "2025-01-15", stock: 50 },
    { id: 2, medicine: "Cough Syrup", expiry: "2025-01-20", stock: 25 },
    { id: 3, medicine: "Antibiotics", expiry: "2025-01-25", stock: 30 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
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
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <span>{t.recentSales}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{sale.medicine}</p>
                    <p className="text-sm text-gray-600">Qty: {sale.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{sale.amount}</p>
                    <p className="text-xs text-gray-500">{sale.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Medicines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span>{t.expiringMedicines}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringMedicines.map((medicine) => (
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
