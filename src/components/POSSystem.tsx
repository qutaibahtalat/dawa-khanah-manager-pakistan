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
import protectedMedicines from '@/data/protectedMedicines';
import { fetchPOSMedicines } from '@/utils/posAPI';

interface POSSystemProps {
  isUrdu: boolean;
}

interface InventoryItem {
  id: number;
  name: string;
  genericName?: string;
  manufacturer: string;
  price: number;
  stock: number;
  barcode?: string;
}

type Customer = {
  id: number;
  mrNumber: string;
  name: string;
  phone: string;
  creditLimit: number;
  creditUsed: number;
  purchases: Array<{
    medicine: string;
    date: string;
    quantity: number;
    price: number;
  }>;
};

type CartItem = InventoryItem & {
  quantity: number;
};

const POSSystem: React.FC<POSSystemProps> = ({ isUrdu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', id: '', mrNumber: '' });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [amountReceived, setAmountReceived] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [discount, setDiscount] = useState<number | string>('');
  const [customerHistory, setCustomerHistory] = useState<{
    purchases: Array<{medicine: string, date: string, quantity: number, price: number}>,
    credit: {total: number, used: number, remaining: number}
  } | null>(null);
  const [mrNumber, setMrNumber] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  
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

    // Medicine recommendations if not found in stock
    if (results.length === 0 && term.trim()) {
      // Dynamically import full medicine database and search utilities
      import('../utils/medicineDatabase').then(dbMod => {
        // Only generate/load the database once (cache in window)
        if (!(window as any)._fullMedicineDB) {
          (window as any)._fullMedicineDB = dbMod.generateMedicineDatabase();
        }
        const fullDB = (window as any)._fullMedicineDB;
        const matches = dbMod.searchMedicines(fullDB, term).slice(0, 8);
        setRecommendations(matches);
      }).catch(() => setRecommendations([]));
    } else {
      setRecommendations([]);
    }
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

  useEffect(() => {
    const syncInventory = async () => {
      try {
        const response = await fetch('/api/inventory');
        const data = await response.json();
        setInventory(data);
      } catch (error) {
        console.error('Failed to sync inventory:', error);
      }
    };
    
    // Sync every 30 seconds and on component mount
    syncInventory();
    const interval = setInterval(syncInventory, 30000);
    return () => clearInterval(interval);
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

  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const data = await fetchPOSMedicines();
        setMedicines(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load medicines:', error);
      }
    };
    loadMedicines();
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

  const getCustomerByMRNumber = (mrNumber: string) => {
    try {
      const customers = JSON.parse(localStorage.getItem('customers') || '[]');
      const customer = customers.find((c: any) => c.mrNumber === mrNumber);
      
      if (!customer) return null;
      
      // Get customer purchase history
      const sales = JSON.parse(localStorage.getItem('sales') || '[]');
      const customerSales = sales.filter((s: any) => s.customerId === customer.id);
      
      // Get customer credit info
      const creditInfo = {
        total: customer.creditLimit || 0,
        used: customer.creditUsed || 0,
        remaining: (customer.creditLimit || 0) - (customer.creditUsed || 0)
      };
      
      return {
        customer,
        history: {
          purchases: customerSales.map((s: any) => ({
            medicine: s.items.map((i: any) => i.name).join(', '),
            date: s.date,
            quantity: s.items.reduce((sum: number, i: any) => sum + i.quantity, 0),
            price: s.total
          })),
          credit: creditInfo
        }
      };
    } catch (error) {
      console.error('Error fetching customer data:', error);
      return null;
    }
  };

  useEffect(() => {
    if (customerInfo.mrNumber && customerInfo.mrNumber.length >= 3) {
      const customerData = getCustomerByMRNumber(customerInfo.mrNumber);
      
      if (customerData) {
        setCustomerInfo({
          name: customerData.customer.name,
          phone: customerData.customer.phone,
          id: customerData.customer.id,
          mrNumber: customerData.customer.mrNumber
        });
        setCustomerHistory(customerData.history);
      } else {
        toast({
          title: isUrdu ? 'گاہک نہیں ملا' : 'Customer Not Found',
          description: isUrdu 
            ? 'براہ کرم ایم آر نمبر کی تصدیق کریں' 
            : 'Please verify the MR number',
          variant: 'destructive',
        });
        setCustomerHistory(null);
      }
    } else {
      setCustomerHistory(null);
    }
  }, [customerInfo.mrNumber]);

  const addToCart = (medicine: InventoryItem) => {
    if (medicine.stock <= 0) {
      toast({
        title: 'Out of stock',
        description: 'This item is currently out of stock',
        variant: 'destructive'
      });
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.id === medicine.id);
      
      // Update inventory stock
      setInventory(prevInv => 
        prevInv.map(item => 
          item.id === medicine.id 
            ? {...item, stock: item.stock - 1} 
            : item
        )
      );
      
      return existing
        ? prev.map(item => 
            item.id === medicine.id 
              ? {...item, quantity: item.quantity + 1} 
              : item
          )
        : [...prev, {...medicine, quantity: 1}];
    });
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
    const removedItem = cartItems.find(item => item.id === id);
    if (removedItem) {
      // Real-time increment in inventory (UI and persistent)
      setInventory(prev => prev.map(item => item.id === id ? { ...item, stock: item.stock + removedItem.quantity } : item));
      updateItemStock(id, removedItem.quantity); // persist
    }
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

  const redeemLoyaltyReward = async (rewardId: string) => {
    if (!customerInfo.phone) return;

    const result = await loyaltyManager.redeemReward(customerInfo.phone, rewardId);
    if (result.success) {
      setLoyaltyDiscount(result.discount || 0);
      const updatedLoyalty = await loyaltyManager.getCustomerPoints(customerInfo.phone);
      setCustomerLoyalty(updatedLoyalty);
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
  const discountAmount = Number(discount) || 0;
  const loyaltyDiscountAmount = subtotal * (loyaltyDiscount / 100);
  const taxableAmount = subtotal - discountAmount - loyaltyDiscountAmount;
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

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // First update inventory quantities
      await Promise.all(cartItems.map(async (item) => {
        await updateItemStock(item.id, -item.quantity);
      }));
      
      // Then process the sale
      const saleData = {
        items: cartItems,
        customer: customerInfo,
        paymentMethod,
        amountReceived,
        total: total,
        date: new Date().toISOString()
      };
      
      await saveSaleToRecent(saleData);
      
      // Reset cart and show success
      setCartItems([]);
      setCustomerInfo({ name: '', phone: '', id: '', mrNumber: '' });
      setShowPaymentDialog(false);
      
      toast({
        title: 'Success',
        description: 'Sale completed and inventory updated',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete sale',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const printEnhancedReceipt = (saleData: any) => {
    const receiptContent = `
    
    
            Mindspire Pharmacy POS Receipt
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
    ${saleData.discount > 0 ? `Discount:           PKR ${saleData.discount.toFixed(2).padStart(8)}\n` : ''}
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
            <title>Mindspire Pharmacy POS Receipt</title>
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

  const calculateDiscount = () => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountPercent = Number(discount) || 0;
    return total * (discountPercent / 100);
  };

  const searchMedicines = (term: string) => {
    const allMedicines = [...medicines, ...protectedMedicines];
    return allMedicines.filter(medicine => 
      medicine.name.toLowerCase().includes(term.toLowerCase()) ||
      medicine.genericName?.toLowerCase().includes(term.toLowerCase()) ||
      medicine.barcode?.includes(term)
    );
  };

  const recommendedMedicines = [...medicines, ...protectedMedicines]
    .filter(m => m.stock > 0)
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5);

  const handleMrLookup = async () => {
    try {
      if (!mrNumber) {
        toast({
          title: 'Error',
          description: 'Please enter MR number',
          variant: 'destructive'
        });
        return;
      }
      
      const response = await fetch(`/api/customers?mrNumber=${mrNumber}`);
      if (!response.ok) {
        throw new Error('Customer not found');
      }
      
      const customerData = await response.json();
      setCustomer(customerData);
      
      if (cart.length > 0) {
        await saveCreditTransaction(customerData.id);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const saveCreditTransaction = async (customerId: number) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          customerId,
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: Math.round(item.salePrice)
          })),
          total: Math.round(calculateTotal())
        })
      });
      
      if (!response.ok) throw new Error('Failed to save transaction');
      toast({
        title: 'Success',
        description: 'Transaction saved to customer profile',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const calculateTotal = () => {
    return Math.round(
      cart.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0)
    );
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

          {/* Recommendations if no stock match */}
          {recommendations.length > 0 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
              <div className="font-semibold text-yellow-700 mb-2">{isUrdu ? 'متبادل دستیاب ادویات' : 'Available Alternatives (Generic Suggestions)'}</div>
              <div className="flex flex-wrap gap-3">
                {recommendations.map((rec: any) => (
                  <Card key={rec.id} className="cursor-pointer hover:shadow-md transition-all border-yellow-400">
                    <CardContent className="p-3">
                      <div className="font-bold text-yellow-800">{rec.name}</div>
                      <div className="text-xs text-yellow-700">{rec.genericName}</div>
                      <div className="text-xs text-yellow-600">{rec.manufacturer}</div>
                      <div className="text-xs text-gray-700">PKR {rec.price}</div>
                      <Button size="sm" className="mt-2" onClick={() => addToCart(rec)}>
                        <Plus className="h-4 w-4 mr-1" /> {isUrdu ? 'کارٹ میں شامل کریں' : 'Add to Cart'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

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
                placeholder={isUrdu ? 'ایم آر نمبر' : 'MR Number'}
                value={mrNumber}
                onChange={(e) => setMrNumber(e.target.value)}
                className="font-poppins mb-2"
              />
              <Button 
                onClick={handleMrLookup}
                className="w-full touch-target font-poppins"
              >
                {isUrdu ? 'گاہک تلاش کریں' : 'Lookup Customer'}
              </Button>
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

          {customerHistory && (
            <div className="mt-4 space-y-2">
              <h3 className="font-medium">{isUrdu ? 'گزشتہ خریداریاں' : 'Purchase History'}</h3>
              <div className="space-y-1">
                {customerHistory.purchases.map((purchase, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{purchase.medicine}</span>
                    <span>{purchase.quantity} x {purchase.price} = {purchase.quantity * purchase.price}</span>
                  </div>
                ))}
              </div>
              
              <h3 className="font-medium mt-2">{isUrdu ? 'کریڈٹ معلومات' : 'Credit Info'}</h3>
              <div className="flex justify-between text-sm">
                <span>{isUrdu ? 'کل کریڈٹ' : 'Total Credit'}:</span>
                <span>{customerHistory.credit.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{isUrdu ? 'استعمال شدہ' : 'Used'}:</span>
                <span>{customerHistory.credit.used}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>{isUrdu ? 'باقی' : 'Remaining'}:</span>
                <span>{customerHistory.credit.remaining}</span>
              </div>
            </div>
          )}

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
                  <span className="font-poppins">PKR {calculateDiscount().toFixed(2)}</span>
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
            <DialogContent className="sm:max-w-[425px]" aria-describedby="payment-dialog-description">
              <div id="payment-dialog-description" className="sr-only">
                Dialog for completing payment transaction
              </div>
              <CardContent className="space-y-4">
                <Select 
                  value={paymentMethod} 
                  onValueChange={(value) => setPaymentMethod(value)}
                  className="mb-4"
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isUrdu ? 'ادائیگی کی قسم' : 'Payment Type'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{isUrdu ? 'نقد' : 'Cash'}</SelectItem>
                    <SelectItem value="credit">{isUrdu ? 'کریڈٹ' : 'Credit'}</SelectItem>
                  </SelectContent>
                </Select>

                <div>
                  <label className="block text-sm font-medium mb-2 font-poppins">{t.amountReceived}</label>
                  <Input 
                    type="number" 
                    value={amountReceived} 
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder="0.00"
                    className="font-poppins"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 font-poppins">{t.discount}</label>
                  <Input 
                    type="number" 
                    value={discount} 
                    onChange={(e) => setDiscount(e.target.value)}
                    min="0"
                    max="100"
                    className="font-poppins"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-poppins">{t.subtotal}:</span>
                      <span className="font-poppins">PKR {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-poppins">{t.discount}:</span>
                      <span className="font-poppins">PKR {calculateDiscount().toFixed(2)}</span>
                    </div>
                    {loyaltyDiscountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span className="font-poppins">{t.loyaltyDiscount}:</span>
                        <span className="font-poppins">PKR {loyaltyDiscountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{t.tax}:</span>
                      <span className="font-medium">PKR {tax.toFixed(2)}</span>
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
                {paymentMethod === 'credit' && customerHistory?.credit.remaining < total && (
                  <div className="bg-red-50 p-4 rounded mt-2">
                    <div className="flex justify-between">
                      <span className="font-poppins">{isUrdu ? 'کریڈٹ ناکافی' : 'Insufficient Credit'}:</span>
                      <span className="font-bold text-red-600 font-poppins">
                        PKR {customerHistory.credit.remaining.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
                {paymentMethod !== 'cash' && (
                  <div className="h-[120px]"></div>
                )}

                <div className="flex space-x-2 pt-2">
                  <Button 
                    onClick={handleCheckout}
                    className="flex-1 touch-target font-poppins"
                    disabled={
                      isProcessing || 
                      (paymentMethod === 'cash' && (!amountReceived || parseFloat(amountReceived) < total)) ||
                      (paymentMethod === 'credit' && customerHistory?.credit.remaining < total)
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
            </DialogContent>
          </Card>
        </div>
      )}
      
      {/* Barcode Scanner Dialog */}
      <Dialog open={showBarcodeScanner} onOpenChange={setShowBarcodeScanner}>
        <DialogContent className="sm:max-w-[425px]" aria-describedby="barcode-dialog-description">
          <div id="barcode-dialog-description" className="sr-only">
            Dialog for scanning barcode
          </div>
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
