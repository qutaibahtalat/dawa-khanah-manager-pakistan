
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  Printer,
  Calculator,
  User,
  Receipt,
  CreditCard,
  Banknote,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface POSSystemProps {
  isUrdu: boolean;
}

const POSSystem: React.FC<POSSystemProps> = ({ isUrdu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [amountReceived, setAmountReceived] = useState('');
  const { toast } = useToast();

  const text = {
    en: {
      title: 'Point of Sale (POS)',
      searchPlaceholder: 'Search medicine name or scan barcode...',
      cart: 'Shopping Cart',
      customer: 'Customer Information',
      customerName: 'Customer Name',
      customerPhone: 'Phone Number',
      subtotal: 'Subtotal',
      discount: 'Discount',
      tax: 'Sales Tax',
      total: 'Total Amount',
      processPayment: 'Process Payment',
      printReceipt: 'Print Receipt',
      clearCart: 'Clear Cart',
      qty: 'Qty',
      price: 'Price',
      amount: 'Amount',
      addToCart: 'Add to Cart',
      paymentMethod: 'Payment Method',
      cash: 'Cash',
      card: 'Card',
      amountReceived: 'Amount Received',
      change: 'Change',
      confirmPayment: 'Confirm Payment',
      cancel: 'Cancel',
      paymentSuccessful: 'Payment successful!',
      receiptPrinted: 'Receipt printed successfully!'
    },
    ur: {
      title: 'پوائنٹ آف سیل',
      searchPlaceholder: 'دوا کا نام یا بار کوڈ...',
      cart: 'خرید کی ٹوکری',
      customer: 'کسٹمر کی معلومات',
      customerName: 'کسٹمر کا نام',
      customerPhone: 'فون نمبر',
      subtotal: 'ذیلی مجموعہ',
      discount: 'رعایت',
      tax: 'سیلز ٹیکس',
      total: 'کل رقم',
      processPayment: 'ادائیگی کریں',
      printReceipt: 'رسید پرنٹ کریں',
      clearCart: 'ٹوکری صاف کریں',
      qty: 'تعداد',
      price: 'قیمت',
      amount: 'رقم',
      addToCart: 'ٹوکری میں شامل',
      paymentMethod: 'ادائیگی کا طریقہ',
      cash: 'نقد',
      card: 'کارڈ',
      amountReceived: 'وصول شدہ رقم',
      change: 'واپسی',
      confirmPayment: 'ادائیگی کی تصدیق',
      cancel: 'منسوخ',
      paymentSuccessful: 'ادائیگی کامیاب!',
      receiptPrinted: 'رسید کامیابی سے پرنٹ ہوئی!'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Sample medicines for POS
  const medicines = [
    {
      id: 1,
      name: 'Panadol Extra',
      genericName: 'Paracetamol',
      price: 35.00,
      stock: 150,
      barcode: '123456789012'
    },
    {
      id: 2,
      name: 'Augmentin 625mg',
      genericName: 'Amoxicillin',
      price: 450.00,
      stock: 45,
      barcode: '123456789013'
    },
    {
      id: 3,
      name: 'Brufen 400mg',
      genericName: 'Ibuprofen',
      price: 60.00,
      stock: 8,
      barcode: '123456789014'
    },
    {
      id: 4,
      name: 'Disprol Syrup',
      genericName: 'Paracetamol',
      price: 85.00,
      stock: 25,
      barcode: '123456789015'
    }
  ];

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.barcode.includes(searchTerm)
  );

  const addToCart = (medicine: any) => {
    const existingItem = cartItems.find(item => item.id === medicine.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === medicine.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...medicine, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, change: number) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + change);
        return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = 0; // Can be implemented with discount logic
  const tax = subtotal * 0.17; // 17% sales tax (example for Pakistan)
  const total = subtotal - discount + tax;
  const change = parseFloat(amountReceived) - total;

  const handleProcessPayment = () => {
    setShowPaymentDialog(true);
  };

  const confirmPayment = () => {
    // Process payment logic here
    toast({
      title: t.paymentSuccessful,
      description: `Total: PKR ${total.toFixed(2)}, Method: ${paymentMethod}`,
    });
    
    setShowPaymentDialog(false);
    setCartItems([]);
    setCustomerInfo({ name: '', phone: '' });
    setAmountReceived('');
  };

  const printReceipt = () => {
    const receiptContent = `
PharmaCare Receipt
==================
Date: ${new Date().toLocaleString()}
Customer: ${customerInfo.name || 'Walk-in Customer'}
Phone: ${customerInfo.phone || 'N/A'}

Items:
${cartItems.map(item => 
  `${item.name} x${item.quantity} @ PKR ${item.price} = PKR ${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

Subtotal: PKR ${subtotal.toFixed(2)}
Tax (17%): PKR ${tax.toFixed(2)}
Total: PKR ${total.toFixed(2)}
Payment: ${paymentMethod.toUpperCase()}
${paymentMethod === 'cash' ? `Received: PKR ${amountReceived}\nChange: PKR ${change.toFixed(2)}` : ''}

Thank you for your purchase!
==================
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Receipt</title></head>
          <body style="font-family: monospace; white-space: pre;">
            ${receiptContent}
          </body>
        </html>
      `);
      printWindow.print();
      printWindow.close();
    }

    toast({
      title: t.receiptPrinted,
      description: 'Receipt has been sent to printer',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setCartItems([])}>
            <Trash2 className="h-4 w-4 mr-2" />
            {t.clearCart}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicine Search & Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Medicine Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMedicines.map((medicine) => (
              <Card key={medicine.id} className="cursor-pointer hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{medicine.name}</h3>
                      <p className="text-sm text-gray-600">{medicine.genericName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-green-600">
                          PKR {medicine.price}
                        </span>
                        <Badge variant={medicine.stock > 10 ? "default" : "secondary"}>
                          Stock: {medicine.stock}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => addToCart(medicine)}
                    className="w-full mt-2"
                    disabled={medicine.stock === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t.addToCart}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart & Checkout */}
        <div className="space-y-4">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{t.customer}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder={t.customerName}
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              />
              <Input
                placeholder={t.customerPhone}
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
              />
            </CardContent>
          </Card>

          {/* Shopping Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>{t.cart} ({cartItems.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Cart is empty</p>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">PKR {item.price} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bill Summary */}
          {cartItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Bill Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>{t.subtotal}:</span>
                  <span>PKR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.discount}:</span>
                  <span>PKR {discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.tax} (17%):</span>
                  <span>PKR {tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>{t.total}:</span>
                  <span>PKR {total.toFixed(2)}</span>
                </div>
                
                <div className="space-y-2 mt-4">
                  <Button className="w-full" onClick={handleProcessPayment}>
                    <Receipt className="h-4 w-4 mr-2" />
                    {t.processPayment}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={printReceipt}>
                    <Printer className="h-4 w-4 mr-2" />
                    {t.printReceipt}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      {showPaymentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t.processPayment}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.paymentMethod}</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center space-x-2">
                        <Banknote className="h-4 w-4" />
                        <span>{t.cash}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="card">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>{t.card}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <div className="flex justify-between">
                  <span>{t.total}:</span>
                  <span className="font-bold">PKR {total.toFixed(2)}</span>
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t.amountReceived}</label>
                    <Input
                      type="number"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  {amountReceived && parseFloat(amountReceived) >= total && (
                    <div className="bg-green-50 p-4 rounded">
                      <div className="flex justify-between">
                        <span>{t.change}:</span>
                        <span className="font-bold text-green-600">PKR {change.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex space-x-2">
                <Button 
                  onClick={confirmPayment} 
                  className="flex-1"
                  disabled={paymentMethod === 'cash' && (!amountReceived || parseFloat(amountReceived) < total)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t.confirmPayment}
                </Button>
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  {t.cancel}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default POSSystem;
