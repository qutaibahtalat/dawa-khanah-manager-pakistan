
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  CheckCircle,
  Gift,
  Star,
  ScanLine,
  Barcode
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { offlineManager } from '../utils/offlineManager';
import { loyaltyManager } from '../utils/loyaltyManager';
import { getInventory, searchInventory, updateItemStock, InventoryItem } from '@/utils/inventoryService';
import { saveSaleToRecent } from '@/utils/salesService';
import { useSettings } from '@/contexts/SettingsContext';
import BarcodeScanner from './BarcodeScanner';

interface POSSystemProps {
  isUrdu: boolean;
}

const POSSystem: React.FC<POSSystemProps> = ({ isUrdu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', id: '' });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [amountReceived, setAmountReceived] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  
  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredItems(inventory);
      return;
    }
    
    const results = inventory.filter(item => 
      item.name.toLowerCase().includes(term.toLowerCase()) ||
      (item.barcode && item.barcode.toLowerCase().includes(term.toLowerCase()))
    );
    setFilteredItems(results);
  };
  
  // Handle barcode scan - this will be defined later in the component
  
  // Load inventory on component mount
  useEffect(() => {
    const loadInventory = async () => {
      try {
        const items = await getInventory();
        setInventory(items);
        setFilteredItems(items);
      } catch (error) {
        console.error('Failed to load inventory:', error);
        toast({
          title: isUrdu ? 'نقص' : 'Error',
          description: isUrdu 
            ? 'انوینٹری لوڈ کرنے میں ناکامی' 
            : 'Failed to load inventory',
          variant: 'destructive'
        });
      }
    };
    
    loadInventory();
  }, []);
  const [customerLoyalty, setCustomerLoyalty] = useState<any>(null);
  const { toast } = useToast();
  const { settings } = useSettings(); // Get settings including tax rate

  const text = {
    en: {
      title: 'Point of Sale (POS)',
      searchPlaceholder: 'Search medicine name or scan barcode...',
      scanBarcode: 'Scan Barcode',
      cart: 'Shopping Cart',
      customer: 'Customer Information',
      customerName: 'Customer Name',
      customerPhone: 'Phone Number',
      loyaltyPoints: 'Loyalty Points',
      availableRewards: 'Available Rewards',
      redeemReward: 'Redeem Reward',
      subtotal: 'Subtotal',
      discount: 'Discount',
      loyaltyDiscount: 'Loyalty Discount',
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
      receiptPrinted: 'Receipt printed successfully!',
      processing: 'Processing...',
      saleCompleted: 'Sale completed successfully!',
      pointsEarned: 'Points Earned',
      tier: 'Tier'
    },
    ur: {
      title: 'پوائنٹ آف سیل',
      searchPlaceholder: 'دوا کا نام یا بار کوڈ...',
      scanBarcode: 'بار کوڈ اسکین',
      cart: 'خرید کی ٹوکری',
      customer: 'کسٹمر کی معلومات',
      customerName: 'کسٹمر کا نام',
      customerPhone: 'فون نمبر',
      loyaltyPoints: 'لائلٹی پوائنٹس',
      availableRewards: 'دستیاب انعامات',
      redeemReward: 'انعام حاصل کریں',
      subtotal: 'ذیلی مجموعہ',
      discount: 'رعایت',
      loyaltyDiscount: 'لائلٹی رعایت',
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
      receiptPrinted: 'رسید کامیابی سے پرنٹ ہوئی!',
      processing: 'پروسیسنگ...',
      saleCompleted: 'فروخت کامیابی سے مکمل!',
      pointsEarned: 'پوائنٹس حاصل ہوئے',
      tier: 'درجہ'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Use the shared inventory service for medicine data
  const [medicines, setMedicines] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load inventory data
  useEffect(() => {
    const loadInventory = () => {
      const inventory = getInventory();
      setMedicines(inventory);
      setIsLoading(false);
    };
    
    loadInventory();
    
    // Listen for inventory updates from other components
    const handleStorageChange = () => {
      loadInventory();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const filteredMedicines = searchTerm 
    ? searchInventory(searchTerm) 
    : medicines;

  // Load customer loyalty points when customer info changes
  useEffect(() => {
    if (customerInfo.phone) {
      const loyalty = loyaltyManager.getCustomerPoints(customerInfo.phone);
      setCustomerLoyalty(loyalty);
    } else {
      setCustomerLoyalty(null);
    }
  }, [customerInfo.phone]);

  const addToCart = (medicine: InventoryItem) => {
    const existingItem = cartItems.find(item => item.id === medicine.id);
    
    if (existingItem) {
      // Don't add more than available in stock
      if (existingItem.quantity >= medicine.stock) {
        toast({
          title: isUrdu ? 'خریداری کی حد' : 'Purchase Limit',
          description: isUrdu 
            ? `صرف ${medicine.stock} اشیاء دستیاب ہیں` 
            : `Only ${medicine.stock} items available in stock`,
          variant: 'destructive',
        });
        return;
      }
      
      setCartItems(cartItems.map(item =>
        item.id === medicine.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Check if there's at least 1 item in stock
      if (medicine.stock < 1) {
        toast({
          title: isUrdu ? 'اسٹاک ختم' : 'Out of Stock',
          description: isUrdu 
            ? 'یہ دوا اس وقت دستیاب نہیں ہے' 
            : 'This medicine is currently out of stock',
          variant: 'destructive',
        });
        return;
      }
      
      setCartItems([...cartItems, { ...medicine, quantity: 1 }]);
    }
    
    // Update local state to reflect the change in stock immediately
    setMedicines(prev => 
      prev.map(item => 
        item.id === medicine.id 
          ? { ...item, stock: Math.max(0, item.stock - 1) } 
          : item
      )
    );
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

  const handleBarcodeScanned = (barcode: string) => {
    setShowBarcodeScanner(false);
    
    // Search inventory for the scanned barcode
    const inventory = getInventory();
    const product = inventory.find(item => item.barcode === barcode);
    
    if (product) {
      // Add the product to cart
      addToCart(product);
      
      // Show success message
      toast({
        title: isUrdu ? 'کامیابی' : 'Success',
        description: isUrdu 
          ? `${product.name} کارٹ میں شامل کر دیا گیا ہے` 
          : `${product.name} has been added to cart`,
      });
    } else {
      // Show error if product not found
      toast({
        title: isUrdu ? 'خرابی' : 'Error',
        description: isUrdu 
          ? 'دوا نہیں ملی' 
          : 'Product not found',
        variant: 'destructive',
      });
    }
  };

  const handleScanBarcode = () => {
    setShowBarcodeScanner(true);
  };

  const redeemLoyaltyReward = (rewardId: string) => {
    if (!customerInfo.phone) return;

    const result = loyaltyManager.redeemReward(customerInfo.phone, rewardId);
    if (result.success) {
      setLoyaltyDiscount(result.discount || 0);
      setCustomerLoyalty(loyaltyManager.getCustomerPoints(customerInfo.phone));
      toast({
        title: "Reward Redeemed!",
        description: result.message,
      });
    } else {
      toast({
        title: "Redemption Failed",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = 0;
  const loyaltyDiscountAmount = subtotal * (loyaltyDiscount / 100);
  const taxableAmount = subtotal - discount - loyaltyDiscountAmount;
  const taxRate = parseFloat(settings.taxRate) || 0; // Get tax rate from settings
  const tax = taxableAmount * (taxRate / 100); // Calculate tax based on the rate from settings
  const total = taxableAmount + tax;
  const change = parseFloat(amountReceived) - total;

  const handleProcessPayment = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty. Please add items before processing payment.",
        variant: "destructive"
      });
      return;
    }
    setShowPaymentDialog(true);
  };



  const confirmPayment = async () => {
    setIsProcessing(true);
    
    try {
      // First validate stock
      const insufficientStockItem = cartItems.find(item => {
        const medicine = medicines.find(m => m.id === item.id);
        return medicine && medicine.stock < item.quantity;
      });

      if (insufficientStockItem) {
        const medicine = medicines.find(m => m.id === insufficientStockItem.id);
        throw new Error(`Insufficient stock for ${medicine?.name}. Only ${medicine?.stock} available.`);
      }
      
      // Process payment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add loyalty points if customer is provided
      let pointsEarned = 0;
      if (customerInfo.phone) {
        const updatedLoyalty = loyaltyManager.addPoints(customerInfo.phone, total);
        pointsEarned = loyaltyManager.calculatePoints(total);
        setCustomerLoyalty(updatedLoyalty);
      }

      // Save sale data offline
      const saleData = {
        id: `INV-${Date.now()}`,
        date: new Date(),
        items: cartItems,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        subtotal,
        discount,
        loyaltyDiscount: loyaltyDiscountAmount,
        tax,
        taxRate: taxRate, // Add tax rate to sale data
        total,
        paymentMethod,
        pointsEarned: customerInfo.phone ? loyaltyManager.calculatePoints(total) : 0,
      };

      const existingSales = offlineManager.getData('sales') || [];
      offlineManager.saveData('sales', [...existingSales, saleData]);
      
      // Save to recent sales for dashboard
      cartItems.forEach(item => {
        saveSaleToRecent({
          medicine: item.name,
          customer: customerInfo.name || 'Walk-in Customer',
          amount: item.price * item.quantity,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString()
        });
      });
      
      toast({
        title: t.paymentSuccessful,
        description: `Total: PKR ${total.toFixed(2)}, Points Earned: ${pointsEarned}`,
      });
      
      // Print receipt and update inventory after print
      setTimeout(() => {
        printEnhancedReceipt(saleData);
        // Update inventory only after successful print
        updateInventory(cartItems);
      }, 500);
      
      setShowPaymentDialog(false);
      setCartItems([]);
      setCustomerInfo({ name: '', phone: '', id: '' });
      setAmountReceived('');
      setLoyaltyDiscount(0);
      setCustomerLoyalty(null);
      
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing the payment.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateInventory = (items: any[]) => {
    try {
      items.forEach(item => {
        const medicine = medicines.find(m => m.id === item.id);
        if (medicine) {
          updateItemStock(medicine.id, -item.quantity);
        }
      });
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast({
        title: 'Inventory Update Error',
        description: 'There was an error updating the inventory.',
        variant: 'destructive'
      });
    }
  };

  const printEnhancedReceipt = (saleData: any) => {
    const receiptContent = `
    
    
            PharmaCare Receipt
    ==========================================
    Date: ${new Date(saleData.date).toLocaleString()}
    Invoice: ${saleData.id}
    Customer: ${saleData.customerName || 'Walk-in Customer'}
    Phone: ${saleData.customerPhone || 'N/A'}
    
    Items:
    ==========================================
    ${saleData.items.map((item: any) => 
      `${item.name.padEnd(20)} x${item.quantity.toString().padStart(2)} @ PKR ${item.price.toString().padStart(6)} = PKR ${(item.price * item.quantity).toFixed(2).padStart(8)}`
    ).join('\n')}
    
    ==========================================
    Subtotal:                   PKR ${saleData.subtotal.toFixed(2).padStart(8)}
    ${saleData.loyaltyDiscount > 0 ? `Loyalty Discount:           PKR ${saleData.loyaltyDiscount.toFixed(2).padStart(8)}\n` : ''}
    Tax (${saleData.taxRate}%):              PKR ${saleData.tax.toFixed(2).padStart(8)}
    Total:                      PKR ${saleData.total.toFixed(2).padStart(8)}
    
    Payment Method: ${saleData.paymentMethod.toUpperCase()}
    ${saleData.paymentMethod === 'cash' ? `Amount Received:            PKR ${amountReceived.padStart(8)}\nChange:                     PKR ${change.toFixed(2).padStart(8)}` : ''}
    
    ${saleData.pointsEarned > 0 ? `Points Earned:              ${saleData.pointsEarned}\n` : ''}
    
    ==========================================
              Thank you for your purchase!
                  Visit us again soon!
    ==========================================
    
    
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>PharmaCare Receipt</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                white-space: pre; 
                font-size: 12px;
                margin: 0;
                padding: 20px;
              }
              @media print {
                body { margin: 0; padding: 10px; }
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${receiptContent}
          </body>
        </html>
      `);
    }

    toast({
      title: t.receiptPrinted,
      description: 'Enhanced receipt has been sent to printer',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-headline font-poppins text-gray-900">{t.title}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleScanBarcode} className="touch-target">
            <ScanLine className="h-4 w-4 mr-2" />
            {t.scanBarcode}
          </Button>
          <Button variant="outline" onClick={() => setCartItems([])} className="touch-target">
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
              onChange={handleSearch}
              className="pl-10 pr-10 font-poppins"
            />
            <button
              type="button"
              onClick={handleScanBarcode}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <Barcode className="h-5 w-5" />
            </button>
          </div>

          {/* Medicine Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMedicines.map((medicine) => (
              <Card key={medicine.id} className="cursor-pointer hover:shadow-md transition-all animate-slide-in">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 font-poppins">{medicine.name}</h3>
                      <p className="text-sm text-gray-600 font-poppins">{medicine.genericName}</p>
                      <p className="text-xs text-gray-500 font-poppins">{medicine.manufacturer}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-primary font-poppins">
                          PKR {medicine.price}
                        </span>
                        <Badge variant={medicine.stock > 10 ? "default" : "secondary"} className="font-poppins">
                          Stock: {medicine.stock}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => addToCart(medicine)}
                    className="w-full mt-2 touch-target font-poppins"
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
              <CardTitle className="flex items-center space-x-2 font-poppins">
                <User className="h-5 w-5" />
                <span>{t.customer}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder={t.customerName}
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                className="font-poppins"
              />
              <Input
                placeholder={t.customerPhone}
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                className="font-poppins"
              />
              
              {/* Loyalty Information */}
              {customerLoyalty && (
                <div className="p-3 bg-primary/5 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium font-poppins">{t.loyaltyPoints}:</span>
                    <Badge variant="default" className="font-poppins">
                      <Gift className="h-3 w-3 mr-1" />
                      {customerLoyalty.points}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium font-poppins">{t.tier}:</span>
                    <Badge variant="outline" className="font-poppins">
                      <Star className="h-3 w-3 mr-1" />
                      {customerLoyalty.tier}
                    </Badge>
                  </div>
                  
                  {/* Available Rewards */}
                  {loyaltyManager.getAvailableRewards(customerInfo.phone).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium font-poppins">{t.availableRewards}:</p>
                      {loyaltyManager.getAvailableRewards(customerInfo.phone).slice(0, 2).map((reward) => (
                        <Button
                          key={`reward-${reward.id}`}
                          size="sm"
                          variant="outline"
                          onClick={() => redeemLoyaltyReward(reward.id)}
                          className="w-full text-xs font-poppins"
                        >
                          {reward.name} ({reward.pointsRequired} pts)
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shopping Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 font-poppins">
                <ShoppingCart className="h-5 w-5" />
                <span>{t.cart} ({cartItems.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4 font-poppins">Cart is empty</p>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm font-poppins">{item.name}</p>
                        <p className="text-xs text-gray-600 font-poppins">PKR {item.price} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="touch-target"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-poppins">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="touch-target"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.id)}
                          className="touch-target"
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
                <CardTitle className="flex items-center space-x-2 font-poppins">
                  <Calculator className="h-5 w-5" />
                  <span>Bill Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-poppins">{t.subtotal}:</span>
                  <span className="font-poppins">PKR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-poppins">{t.discount}:</span>
                  <span className="font-poppins">PKR {discount.toFixed(2)}</span>
                </div>
                {loyaltyDiscountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-poppins">{t.loyaltyDiscount}:</span>
                    <span className="font-poppins">PKR {loyaltyDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{t.tax} ({taxRate}%):</span>
                  <span className="font-medium">PKR {tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span className="font-poppins">{t.total}:</span>
                  <span className="font-poppins">PKR {Math.round(total).toFixed(2)}</span>
                </div>
                
                <div className="space-y-2 mt-4">
                  <Button 
                    className="w-full touch-target font-poppins" 
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    {isProcessing ? t.processing : t.processPayment}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Enhanced Payment Dialog */}
      {showPaymentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md animate-slide-in">
            <CardHeader>
              <CardTitle className="font-poppins">{t.processPayment}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 font-poppins">{t.paymentMethod}</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="cash-payment" value="cash">
                      <div className="flex items-center space-x-2">
                        <Banknote className="h-4 w-4" />
                        <span className="font-poppins">{t.cash}</span>
                      </div>
                    </SelectItem>
                    <SelectItem key="card-payment" value="card">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="font-poppins">{t.card}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-poppins">{t.subtotal}:</span>
                    <span className="font-poppins">PKR {subtotal.toFixed(2)}</span>
                  </div>
                  {loyaltyDiscountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="font-poppins">{t.loyaltyDiscount}:</span>
                      <span className="font-poppins">-PKR {loyaltyDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-poppins">{t.tax}:</span>
                    <span className="font-poppins">PKR {tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span className="font-poppins">{t.total}:</span>
                    <span className="font-poppins">PKR {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <div>
                  <div>
                    <label className="block text-sm font-medium mb-2 font-poppins">
                      {t.amountReceived}
                    </label>
                    <Input
                      type="number"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      placeholder="0.00"
                      className="font-poppins"
                    />
                  </div>
                  {amountReceived && parseFloat(amountReceived) >= total && (
                    <div className="bg-green-50 p-4 rounded mt-2">
                      <div className="flex justify-between">
                        <span className="font-poppins">{t.change}:</span>
                        <span className="font-bold text-green-600 font-poppins">
                          PKR {change.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {paymentMethod !== 'cash' && (
                <div className="h-[120px]"></div>
              )}

              <div className="flex space-x-2 pt-2">
                <Button 
                  onClick={confirmPayment}
                  className="flex-1 touch-target font-poppins"
                  disabled={
                    isProcessing || 
                    (paymentMethod === 'cash' && (!amountReceived || parseFloat(amountReceived) < total))
                  }
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isProcessing ? t.processing : t.confirmPayment}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentDialog(false)}
                  disabled={isProcessing}
                  className="touch-target font-poppins"
                >
                  {t.cancel}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Barcode Scanner Dialog */}
      <Dialog open={showBarcodeScanner} onOpenChange={setShowBarcodeScanner}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Barcode className="h-5 w-5 mr-2" />
              {isUrdu ? 'بار کوڈ اسکینر' : 'Barcode Scanner'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <BarcodeScanner 
              onScan={handleBarcodeScanned} 
              isUrdu={isUrdu} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POSSystem;
