import React, { useState, useEffect } from 'react';
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
  BarChart3,
  Plus,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface ReportsProps {
  isUrdu: boolean;
}

interface Medicine {
  name: string;
  stock: number;
  price: number;
  status: 'Good' | 'Low' | 'Out' | 'Expiring';
}

interface CartItem {
  id: string;
  medicine: string;
  quantity: number;
  price: number;
  amount: number;
}

interface Report {
  id: string;
  date: string;
  medicine: string;
  quantity: number;
  amount: number;
  profit: number;
}

const Reports: React.FC<ReportsProps> = ({ isUrdu }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedReport, setSelectedReport] = useState('sales');
  const [showAddReport, setShowAddReport] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [newReport, setNewReport] = useState<Omit<Report, 'id'>>({ 
    date: new Date().toISOString().split('T')[0],
    medicine: '',
    quantity: 0,
    amount: 0,
    profit: 0 
  });

  const [inventory, setInventory] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Load reports and inventory from localStorage on component mount
  useEffect(() => {
    const savedReports = localStorage.getItem('pharmacy_reports');
    const savedInventory = localStorage.getItem('pharmacy_inventory');
    
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
    
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    } else {
      // Initialize with sample data if no inventory exists
      const initialInventory: Medicine[] = [
        { name: 'Panadol Extra', stock: 150, price: 35, status: 'Good' },
        { name: 'Augmentin 625mg', stock: 15, price: 450, status: 'Low' },
        { name: 'Brufen 400mg', stock: 0, price: 60, status: 'Out' },
        { name: 'Vitamin C', stock: 50, price: 15, status: 'Expiring' },
        { name: 'Disprol Syrup', stock: 10, price: 85, status: 'Good' }
      ];
      setInventory(initialInventory);
      localStorage.setItem('pharmacy_inventory', JSON.stringify(initialInventory));
    }
  }, []);

  // Save reports and inventory to localStorage whenever they change
  useEffect(() => {
    if (reports && reports.length > 0) {
      localStorage.setItem('pharmacy_reports', JSON.stringify(reports));
    }
  }, [reports]);
  
  useEffect(() => {
    if (inventory && inventory.length > 0) {
      localStorage.setItem('pharmacy_inventory', JSON.stringify(inventory));
      console.log('Inventory updated:', inventory);
    }
  }, [inventory]);

  const handleAddToCart = () => {
    const medicineItem = inventory.find(item => item.name === newReport.medicine);
    
    if (!medicineItem) {
      alert(isUrdu ? 'دوا نہیں ملی' : 'Medicine not found');
      return;
    }
    
    if (medicineItem.stock < newReport.quantity) {
      alert(isUrdu 
        ? `معذرت، اسٹاک میں صرف ${medicineItem.stock} دستیاب ہیں` 
        : `Sorry, only ${medicineItem.stock} items available in stock`);
      return;
    }
    
    const cartItem: CartItem = {
      id: Date.now().toString(),
      medicine: newReport.medicine,
      quantity: newReport.quantity,
      price: medicineItem.price,
      amount: newReport.amount
    };
    
    setCart([...cart, cartItem]);
    
    // Reset form
    setNewReport({
      date: new Date().toISOString().split('T')[0],
      medicine: '',
      quantity: 0,
      amount: 0,
      profit: 0 
    });
  };
  
  // Function to update inventory when a sale is made
  const updateInventoryForSale = (medicineName: string, quantity: number) => {
    setInventory(prevInventory => {
      return prevInventory.map(item => {
        if (item.name === medicineName) {
          const newStock = Math.max(0, item.stock - quantity);
          const status = newStock === 0 ? 'Out' : 
                         newStock < 10 ? 'Low' : 'Good';
          
          console.log(`Updating ${medicineName} stock: ${item.stock} -> ${newStock}`);
          
          return {
            ...item,
            stock: newStock,
            status: status
          };
        }
        return item;
      });
    });
  };

  const handleProcessPayment = () => {
    if (cart.length === 0) return;
    
    // First update the inventory synchronously
    setInventory(prevInventory => {
      const updatedInventory = [...prevInventory];
      
      cart.forEach(cartItem => {
        const itemIndex = updatedInventory.findIndex(i => i.name === cartItem.medicine);
        if (itemIndex !== -1) {
          const currentItem = updatedInventory[itemIndex];
          const newStock = Math.max(0, currentItem.stock - cartItem.quantity);
          const status = newStock === 0 ? 'Out' : newStock < 10 ? 'Low' : 'Good';
          
          console.log(`Processing payment - Updating ${currentItem.name} stock: ${currentItem.stock} -> ${newStock}`);
          
          updatedInventory[itemIndex] = {
            ...currentItem,
            stock: newStock,
            status: status
          };
        }
      });
      
      // Save to localStorage immediately
      localStorage.setItem('pharmacy_inventory', JSON.stringify(updatedInventory));
      console.log('Inventory after payment:', updatedInventory);
      
      return updatedInventory;
    });
    
    // Create reports for each cart item
    const newReports: Report[] = cart.map(item => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      medicine: item.medicine,
      quantity: item.quantity,
      amount: item.amount,
      profit: item.amount * 0.3 // 30% profit
    }));
    
    // Update reports
    setReports(prevReports => {
      const updatedReports = [...prevReports, ...newReports];
      localStorage.setItem('pharmacy_reports', JSON.stringify(updatedReports));
      return updatedReports;
    });
    
    console.log('Processed payment for items:', cart);
    
    // Clear cart and close dialogs
    setCart([]);
    setShowPaymentDialog(false);
    setShowAddReport(false);
  };

  const handleInputChange = (field: keyof Omit<Report, 'id'>, value: string | number) => {
    if (!newReport) return;
    setNewReport(prev => {
      const updated = {
        ...prev,
        [field]: field === 'date' || field === 'medicine' ? value : Number(value)
      };
      
      // If medicine or quantity changes, update amount and profit
      if (field === 'medicine' || field === 'quantity') {
        const medicine = inventory.find(m => m.name === (field === 'medicine' ? value : prev.medicine));
        if (medicine) {
          const qty = field === 'quantity' ? Number(value) : prev.quantity;
          updated.amount = qty * medicine.price;
          updated.profit = qty * (medicine.price * 0.3); // 30% profit
        }
      }
      
      return updated;
    });
  };

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

  // Calculate report data from actual reports
  const salesData = reports ? reports.reduce((acc, report) => ({
    totalSales: acc.totalSales + (report.amount || 0),
    totalProfit: acc.totalProfit + (report.profit || 0),
    itemsSold: acc.itemsSold + (report.quantity || 0),
    transactions: acc.transactions + 1
  }), { totalSales: 0, totalProfit: 0, itemsSold: 0, transactions: 0 }) : 
  { totalSales: 0, totalProfit: 0, itemsSold: 0, transactions: 0 };
  
  // Calculate cart total
  const cartTotal = cart ? cart.reduce((total, item) => total + (item.amount || 0), 0) : 0;

  // Get recent sales (last 10)
  const recentSales = [...reports]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Calculate inventory data from current inventory state
  const inventoryData = inventory.map(item => ({
    medicine: item.name,
    stock: item.stock,
    value: item.stock * item.price,
    status: item.stock === 0 ? 'Out' : 
           item.stock < 10 ? 'Low' :
           item.status === 'Expiring' ? 'Expiring' : 'Good'
  }));

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
            <Button onClick={() => setShowAddReport(true)} className="bg-green-600 hover:bg-green-700">
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
                    {reports.length > 0 ? (
                      reports.map((report) => (
                        <tr key={report.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{report.date}</td>
                          <td className="p-2 font-medium">{report.medicine}</td>
                          <td className="p-2">{report.quantity}</td>
                          <td className="p-2 text-green-600">PKR {report.amount}</td>
                          <td className="p-2 text-blue-600">PKR {report.profit}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500">
                          {isUrdu ? 'کوئی رپورٹ دستیاب نہیں ہے' : 'No reports available'}
                        </td>
                      </tr>
                    )}
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

      {/* Cart Summary */}
      {cart.length > 0 && (
        <Card className="fixed bottom-4 right-4 w-96 shadow-lg">
          <CardHeader className="bg-gray-50 p-4">
            <CardTitle className="text-lg font-semibold">
              {isUrdu ? 'بل کا خلاصہ' : 'Bill Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="font-medium">{item.medicine}</span>
                  <div className="flex items-center space-x-4">
                    <span>{item.quantity} x {item.price}</span>
                    <span className="font-semibold">PKR {item.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>{isUrdu ? 'کل رقم' : 'Total'}</span>
                  <span>PKR {cartTotal.toFixed(2)}</span>
                </div>
              </div>
              <Button 
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
                onClick={() => setShowPaymentDialog(true)}
              >
                {isUrdu ? 'ادائیگی کریں' : 'Process Payment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Confirmation Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isUrdu ? 'ادائیگی کی تصدیق کریں' : 'Confirm Payment'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              {isUrdu 
                ? 'کیا آپ ادائیگی کی تصدیق کرنا چاہتے ہیں؟' 
                : 'Are you sure you want to confirm this payment?'}
            </p>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.medicine} (x{item.quantity})</span>
                  <span>PKR {item.amount?.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 font-semibold">
                <div className="flex justify-between">
                  <span>{isUrdu ? 'کل رقم' : 'Total'}:</span>
                  <span>PKR {cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentDialog(false)}
            >
              {isUrdu ? 'منسوخ کریں' : 'Cancel'}
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleProcessPayment}
            >
              {isUrdu ? 'ادائیگی کی تصدیق کریں' : 'Confirm Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add to Cart Dialog */}
      <Dialog open={showAddReport} onOpenChange={setShowAddReport}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isUrdu ? 'نیا رپورٹ شامل کریں' : 'Add New Report'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                {isUrdu ? 'تاریخ' : 'Date'}
              </Label>
              <Input
                id="date"
                type="date"
                className="col-span-3"
                value={newReport.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="medicine" className="text-right">
                {isUrdu ? 'دوا' : 'Medicine'}
              </Label>
              <Select 
                value={newReport.medicine}
                onValueChange={(value) => handleInputChange('medicine', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={isUrdu ? 'دوا منتخب کریں' : 'Select medicine'} />
                </SelectTrigger>
                <SelectContent>
                  {inventory
                    .filter(item => item.stock > 0) // Only show medicines with available stock
                    .map((item) => (
                      <SelectItem key={item.name} value={item.name}>
                        {item.name} ({item.stock} {isUrdu ? 'دستیاب' : 'available'})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                {isUrdu ? 'مقدار' : 'Quantity'}
              </Label>
              <Input
                id="quantity"
                type="number"
                className="col-span-3"
                value={newReport.quantity || ''}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                min="1"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                {isUrdu ? 'رقم' : 'Amount'}
              </Label>
              <div className="relative col-span-3">
                <span className="absolute left-3 top-2">PKR</span>
                <Input
                  id="amount"
                  type="number"
                  className="pl-12"
                  value={newReport.amount || ''}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profit" className="text-right">
                {isUrdu ? 'منافع' : 'Profit'}
              </Label>
              <div className="relative col-span-3">
                <span className="absolute left-3 top-2">PKR</span>
                <Input
                  id="profit"
                  type="number"
                  className="pl-12"
                  value={newReport.profit.toFixed(2) || '0.00'}
                  readOnly
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddReport(false)}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              {isUrdu ? 'منسوخ کریں' : 'Cancel'}
            </Button>
            <Button 
              type="submit"
              onClick={handleAddToCart}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              disabled={!newReport.medicine || !newReport.quantity}
            >
              <Plus className="h-4 w-4" />
              {isUrdu ? 'کارٹ میں شامل کریں' : 'Add to Cart'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
