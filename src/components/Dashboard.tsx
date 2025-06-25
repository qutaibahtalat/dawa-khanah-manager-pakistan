
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  ShoppingCart,
  Users,
  Calendar as CalendarIcon2,
  Clock,
  Printer,
  Save
} from 'lucide-react';

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
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    productName: '',
    price: '',
    tax: '17', // Default tax rate in Pakistan
    discount: '0',
    date: new Date(),
    time: new Date().toTimeString().substring(0, 5)
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{text: string; type: 'success' | 'error'} | null>(null);

  const handleSave = async () => {
    // Basic validation
    if (!formData.customerName.trim() || !formData.productName.trim() || !formData.price) {
      setSaveMessage({
        text: isUrdu ? 'براہ کرم تمام ضروری فیلڈز بھریں' : 'Please fill in all required fields',
        type: 'error'
      });
      return;
    }

    // Validate price is a number
    if (isNaN(parseFloat(formData.price))) {
      setSaveMessage({
        text: isUrdu ? 'قیمت ایک درست نمبر ہونی چاہیے' : 'Price must be a valid number',
        type: 'error'
      });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new sale item
      const newSale: SaleItem = {
        id: Date.now().toString(),
        medicine: formData.productName,
        customer: formData.customerName,
        amount: parseFloat(formData.price) * (1 + parseFloat(formData.tax) / 100) - parseFloat(formData.discount || '0'),
        time: formData.time,
        date: formData.date ? format(formData.date, 'MMM dd, yyyy') : ''
      };
      
      // Add to recent sales (keep only last 5 sales) and save to localStorage
      const updatedSales = [newSale, ...recentSales].slice(0, 5);
      setRecentSales(updatedSales);
      saveToLocalStorage(updatedSales);
      
      // Show success message
      setSaveMessage({
        text: isUrdu ? 'فروخت کامیابی سے محفوظ ہو گئی' : 'Sale saved successfully!',
        type: 'success'
      });
      
      // Reset form after successful save
      setFormData(prev => ({
        ...prev,
        customerName: '',
        productName: '',
        price: '',
        discount: '0'
      }));
      
    } catch (error) {
      console.error('Error saving data:', error);
      setSaveMessage({
        text: isUrdu ? 'محفوظ کرتے وقت خرابی آئی' : 'Error saving data',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

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


  // Load initial data from localStorage on component mount
  React.useEffect(() => {
    const savedSales = loadFromLocalStorage();
    if (savedSales.length > 0) {
      setRecentSales(savedSales);
    }
  }, []);

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
            <CalendarIcon2 className="h-4 w-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Billing Form */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{isUrdu ? 'بل کی تفصیلات' : 'Billing Details'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">{isUrdu ? 'گاہک کا نام' : 'Customer Name'}</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder={isUrdu ? 'گاہک کا نام درج کریں' : 'Enter customer name'}
                />
              </div>
              <div>
                <Label htmlFor="productName">{isUrdu ? 'پروڈکٹ کا نام' : 'Product Name'}</Label>
                <Input
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  placeholder={isUrdu ? 'پروڈکٹ کا نام درج کریں' : 'Enter product name'}
                />
              </div>
              <div>
                <Label htmlFor="price">{isUrdu ? 'قیمت (PKR)' : 'Price (PKR)'}</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tax">{isUrdu ? 'ٹیکس (%)' : 'Tax (%)'}</Label>
                <Input
                  id="tax"
                  name="tax"
                  type="number"
                  value={formData.tax}
                  onChange={handleInputChange}
                  placeholder="17"
                />
              </div>
              <div>
                <Label htmlFor="discount">{isUrdu ? 'چھوٹ (PKR)' : 'Discount (PKR)'}</Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  value={formData.discount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isUrdu ? 'تاریخ' : 'Date'}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? formatDate(formData.date) : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => setFormData({...formData, date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="time">{isUrdu ? 'وقت' : 'Time'}</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 mt-6">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              {isUrdu ? 'پرنٹ کریں' : 'Print'}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className={cn("min-w-[100px]", isSaving && "opacity-70")}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isUrdu ? 'محفوظ ہو رہا ہے...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isUrdu ? 'محفوظ کریں' : 'Save'}
                </>
              )}
            </Button>
            {saveMessage && (
              <div className={`mt-2 text-sm ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {saveMessage.text}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
