import React, { useState, useEffect, FC, ReactNode, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, User, Truck, X, Download, RefreshCw, ScanLine, Barcode } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getInventory, saveInventory, updateItemStock } from '@/utils/inventoryService';
import { saveSaleToRecent } from '@/utils/salesService';
// Define SaleItem interface locally since it's not found in @/types/sale
interface SaleItem {
  id: string;
  medicine: string;
  customer: string;
  amount: number;
  time: string;
  date: string;
}
import { useToast } from '@/hooks/use-toast';
import BarcodeScanner from './BarcodeScanner';

interface MedicineEntry {
  id: string;
  medicineName: string;
  quantity: number;
  price: number;
  timestamp: string;
  batchNo?: string;
  expiryDate?: string;
  reason?: string;
}

interface SubmittedReturn {
  id: string;
  type: 'customer' | 'supplier';
  name: string;
  companyName?: string;
  medicines: MedicineEntry[];
  date: string;
  time: string;
}

interface ReturnsPageProps {
  isUrdu: boolean;
}

const ReturnsPage: FC<ReturnsPageProps> = ({ isUrdu }) => {
  // State for dialogs
  const [showCustomerReturn, setShowCustomerReturn] = useState(false);
  const [showSupplierReturn, setShowSupplierReturn] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [currentMedicines, setCurrentMedicines] = useState<MedicineEntry[]>([]);
  const [reason, setReason] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [activeScannerFor, setActiveScannerFor] = useState<'customer' | 'supplier' | null>(null);
  
  // Data state
  const [submittedReturns, setSubmittedReturns] = useState<SubmittedReturn[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'customer' | 'supplier'>('all');
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const { toast } = useToast();
  
  // Add medicine to current return
  const addMedicineEntry = () => {
    if (!medicineName.trim() || !quantity || !price) {
      toast({
        title: isUrdu ? 'خالی فیلڈز' : 'Missing Fields',
        description: isUrdu ? 'براہ کرم تمام فیلڈز بھریں' : 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    const newMedicine: MedicineEntry = {
      id: Date.now().toString(),
      medicineName: medicineName.trim(),
      quantity: Number(quantity),
      price: Number(price),
      timestamp: new Date().toISOString()
    };

    setCurrentMedicines([...currentMedicines, newMedicine]);
    setMedicineName('');
    setQuantity(1);
    setPrice(0);
  };

  // Remove medicine from current return
  const removeMedicineEntry = (id: string) => {
    setCurrentMedicines(currentMedicines.filter(med => med.id !== id));
  };

  // Update inventory with returned items
  const updateInventoryWithReturn = (medicines: MedicineEntry[]): boolean => {
    try {
      if (!medicines || medicines.length === 0) {
        return false;
      }

      const inventory = getInventory();
      const updatedInventory = [...inventory];
      let inventoryUpdated = false;

      for (const returnedItem of medicines) {
        try {
          if (!returnedItem?.medicineName) {
            continue;
          }

          const medicineName = returnedItem.medicineName.trim();
          if (!medicineName) {
            continue;
          }

          // Find the item in inventory
          const inventoryItemIndex = updatedInventory.findIndex(
            (item: any) => item?.name?.toLowerCase() === medicineName.toLowerCase()
          );

          if (inventoryItemIndex >= 0) {
            // Update existing inventory item
            const existingItem = updatedInventory[inventoryItemIndex];
            const stock = parseInt(existingItem.stock.toString(), 10);
            if (stock > 0) {
              updatedInventory[inventoryItemIndex] = {
                ...existingItem,
                stock: (stock + returnedItem.quantity)
              };
              inventoryUpdated = true;
            }
          } else {
            // Add new inventory item
            updatedInventory.push({
              id: Date.now(),
              name: medicineName,
              stock: returnedItem.quantity,
              price: 0,
              genericName: '',
              barcode: '',
              category: 'Returns',
              manufacturer: 'Unknown',
              minStock: 0,
              maxStock: 0,
              purchasePrice: 0,
              expiryDate: '',
              manufacturingDate: ''
            });
            inventoryUpdated = true;
          }
        } catch (error) {
          console.error('Error processing medicine entry:', error);
          // Continue with next item even if one fails
        }
      }

      if (inventoryUpdated) {
        saveInventory(updatedInventory);
        // Trigger a real-time UI update in other tabs/windows
        window.dispatchEvent(new Event('storage'));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating inventory with return:', error);
      return false;
    }
  };

  // Add this function to handle inventory updates
  const updateInventoryOnReturn = async (medicines: MedicineEntry[], returnType: 'customer' | 'supplier') => {
    try {
      const inventory = await getInventory();
      
      medicines.forEach(returnItem => {
        const inventoryItem = inventory.find(item => item.id === returnItem.id);
        
        if (inventoryItem) {
          // For customer returns, increase stock (product coming back to pharmacy)
          // For supplier returns, decrease stock (product going back to supplier)
          const stockChange = returnType === 'customer' 
            ? returnItem.quantity 
            : -returnItem.quantity;
          
          inventoryItem.stock += stockChange;
          
          // Update batch information if provided
          if (returnItem.batchNo) {
            inventoryItem.batchNumber = returnItem.batchNo;
          }
          
          if (returnItem.expiryDate) {
            inventoryItem.expiryDate = returnItem.expiryDate;
          }
        }
      });
      
      await saveInventory(inventory);
      
      toast({
        title: isUrdu ? 'انوینٹری اپ ڈیٹ ہو گئی' : 'Inventory Updated',
        description: isUrdu 
          ? 'ریٹرن کے بعد انوینٹری کامیابی سے اپ ڈیٹ ہو گئی' 
          : 'Inventory has been successfully updated after return',
        variant: 'default'
      });
      
      return true;
    } catch (error) {
      console.error('Failed to update inventory:', error);
      toast({
        title: isUrdu ? 'انوینٹری اپ ڈیٹ میں ناکامی' : 'Inventory Update Failed',
        description: isUrdu 
          ? 'ریٹرن پر انوینٹری اپ ڈیٹ کرنے میں خرابی آئی ہے' 
          : 'Failed to update inventory on return',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Load saved returns on component mount
  useEffect(() => {
    try {
      const savedReturns = localStorage.getItem('submittedReturns');
      if (savedReturns) {
        setSubmittedReturns(JSON.parse(savedReturns));
      }
    } catch (error) {
      console.error('Failed to load saved returns:', error);
    }
  }, []);

  // Helper function to safely serialize returns data
  const serializeReturns = (returns: SubmittedReturn[]) => {
    return returns.map(returnItem => ({
      ...returnItem,
      date: returnItem.date || new Date().toISOString(),
      time: returnItem.time || new Date().toISOString(),
      medicines: returnItem.medicines.map(med => ({
        ...med,
        // Ensure all properties are serializable
        id: String(med.id || ''),
        medicineName: String(med.medicineName || ''),
        quantity: Number(med.quantity) || 0,
        price: Number(med.price) || 0,
        timestamp: med.timestamp && !isNaN(new Date(med.timestamp).getTime()) 
          ? new Date(med.timestamp).toISOString() 
          : new Date().toISOString(),
        ...(med.reason && { reason: String(med.reason) }),
        ...(med.batchNo && { batchNo: String(med.batchNo) }),
        ...(med.expiryDate && { 
          expiryDate: !isNaN(new Date(med.expiryDate).getTime())
            ? new Date(med.expiryDate).toISOString()
            : String(med.expiryDate)
        })
      }))
    }));
  };

  // Save returns to localStorage whenever they change
  useEffect(() => {
    if (submittedReturns.length > 0) {
      try {
        const serializedReturns = serializeReturns(submittedReturns);
        localStorage.setItem('pharmacyReturns', JSON.stringify(serializedReturns));
        localStorage.setItem('submittedReturns', JSON.stringify(serializedReturns));
      } catch (error) {
        console.error('Error saving returns to localStorage:', error);
      }
    }
  }, [submittedReturns]);

  // Load saved returns from localStorage on component mount and update inventory
  useEffect(() => {
    try {
      const savedReturns = localStorage.getItem('pharmacyReturns');
      if (savedReturns) {
        const parsedReturns = JSON.parse(savedReturns);
        if (Array.isArray(parsedReturns)) {
          // Migrate old return entries to the new format if needed
          const migratedReturns = parsedReturns.map(returnItem => {
            // If this is an old return entry without medicines array, create one
            if (!returnItem.medicines) {
              return {
                ...returnItem,
                medicines: [{
                  id: returnItem.id || Date.now().toString(),
                  medicineName: returnItem.medicineName || '',
                  quantity: returnItem.quantity || 0,
                  price: returnItem.price || 0,
                  timestamp: returnItem.time || new Date().toISOString()
                }]
              };
            }
            return returnItem;
          });
          
          setSubmittedReturns(migratedReturns);
          // Save migrated data back to localStorage
          localStorage.setItem('pharmacyReturns', JSON.stringify(migratedReturns));
          
          // Update inventory with all customer returns
          const customerReturns = migratedReturns.filter((item: SubmittedReturn) => item.type === 'customer');
          if (customerReturns.length > 0) {
            // Get all medicines from customer returns
            const allReturnedMedicines = customerReturns.flatMap((returnItem: SubmittedReturn) => returnItem.medicines);
            if (allReturnedMedicines.length > 0) {
              updateInventoryWithReturn(allReturnedMedicines);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load saved returns:', error);
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (type: 'customer' | 'supplier', medicine: { name: string; quantity: number; price: number }) => {
    if (!medicine.name.trim() || !medicine.quantity || !medicine.price) {
      toast({
        title: isUrdu ? 'خالی فیلڈز' : 'Missing Fields',
        description: isUrdu ? 'براہ کرم تمام فیلڈز بھریں' : 'Please fill in all fields',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const now = new Date();
      const nameToUse = type === 'customer' 
        ? (customerName.trim() || (isUrdu ? 'نامعلوم گاہک' : 'Unknown Customer'))
        : (supplierName.trim() || (isUrdu ? 'نامعلوم سپلائر' : 'Unknown Supplier'));
      
      const companyNameToUse = type === 'supplier' && companyName.trim() === '' 
        ? (isUrdu ? 'نامعلوم کمپنی' : 'Unknown Company')
        : companyName;

      // Create a single medicine entry
      const medicineEntry: MedicineEntry = {
        id: Date.now().toString(),
        medicineName: medicine.name.trim(),
        quantity: Number(medicine.quantity),
        price: Number(medicine.price),
        timestamp: now.toISOString()
      };

      // For customer returns, update inventory and POS
      if (type === 'customer') {
        const success = await updateInventoryOnReturn([medicineEntry], type);
        if (!success) {
          throw new Error('Failed to update inventory');
        }
      }

      const newReturn: SubmittedReturn = {
        id: Date.now().toString(),
        type,
        name: nameToUse,
        companyName: type === 'supplier' ? companyNameToUse : undefined,
        medicines: [medicineEntry],
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Update state and localStorage
      const updatedReturns = [{
        ...newReturn,
        medicines: newReturn.medicines.map(med => ({
          ...med,
          // Ensure all properties are serializable
          id: String(med.id),
          medicineName: String(med.medicineName),
          quantity: Number(med.quantity),
          price: Number(med.price),
          timestamp: med.timestamp || new Date().toISOString(),
          ...(med.reason && { reason: String(med.reason) }),
          ...(med.batchNo && { batchNo: String(med.batchNo) }),
          ...(med.expiryDate && { expiryDate: String(med.expiryDate) })
        }))
      }, ...submittedReturns];
      
      setSubmittedReturns(updatedReturns);
      try {
        const serializedReturns = serializeReturns(updatedReturns);
        localStorage.setItem('pharmacyReturns', JSON.stringify(serializedReturns));
      } catch (error) {
        console.error('Error saving returns to localStorage:', error);
      }

      // Reset form and close dialog
      setMedicineName('');
      setQuantity(1);
      setPrice(0);
      
      if (type === 'customer') {
        setCustomerName('');
        setShowCustomerReturn(false);
      } else {
        setSupplierName('');
        setCompanyName('');
        setShowSupplierReturn(false);
      }

      // Show success message
      toast({
        title: isUrdu ? 'کامیابی' : 'Success',
        description: type === 'customer'
          ? (isUrdu ? 'گاہک کی واپسی کامیابی سے محفوظ ہو گئی' : 'Customer return saved successfully')
          : (isUrdu ? 'سپلائر کو واپسی کامیابی سے محفوظ ہو گئی' : 'Supplier return saved successfully')
      });
    } catch (error) {
      console.error('Error processing return:', error);
      toast({
        title: isUrdu ? 'خرابی' : 'Error',
        description: isUrdu 
          ? 'واپسی پراسیس کرتے وقت خرابی آئی' 
          : 'Error processing return',
        variant: 'destructive'
      });
    }
  };

  // Handle delete return
  const handleDeleteReturn = (id: string) => {
    setSubmittedReturns(prevReturns => 
      prevReturns.filter(returnItem => returnItem.id !== id)
    );
    
    toast({
      title: isUrdu ? 'کامیابی' : 'Success',
      description: isUrdu 
        ? 'واپسی کی ریکارڈ حذف کر دی گئی ہے' 
        : 'Return record has been deleted',
    });
  };

  // Handle process return
  const handleProcessReturn = (returnItem: SubmittedReturn) => {
    if (returnItem.type === 'customer') {
      // For customer returns, we need to add the items back to inventory
      const success = updateInventoryWithReturn(returnItem.medicines);
      
      if (success) {
        // Remove the processed return from the list
        setSubmittedReturns(prevReturns => 
          prevReturns.filter(item => item.id !== returnItem.id)
        );
        
        toast({
          title: isUrdu ? 'کامیابی' : 'Success',
          description: isUrdu 
            ? 'واپسی کی گئی ادویات انوینٹری میں شامل کر دی گئی ہیں' 
            : 'Returned items have been added back to inventory',
        });
      } else {
        toast({
          title: isUrdu ? 'خرابی' : 'Error',
          description: isUrdu 
            ? 'انوینٹری اپ ڈیٹ کرتے وقت خرابی آئی ہے' 
            : 'Error updating inventory',
          variant: 'destructive',
        });
      }
    } else {
      // For supplier returns, we just need to remove the return record
      // as the items have already been returned to the supplier
      setSubmittedReturns(prevReturns => 
        prevReturns.filter(item => item.id !== returnItem.id)
      );
      
      toast({
        title: isUrdu ? 'کامیابی' : 'Success',
        description: isUrdu 
          ? 'سپلائر کو واپسی کی تصدیق ہو گئی ہے' 
          : 'Supplier return has been confirmed',
      });
    }
  };

  // Export returns to CSV
  const exportReturnsToCSV = () => {
    try {
      if (!submittedReturns.length) {
        toast({
          title: isUrdu ? 'انتباہ' : 'Warning',
          description: isUrdu ? 'براہ کرم پہلے کچھ واپسی شامل کریں۔' : 'Please add some returns first.',
          variant: 'destructive'
        });
        return;
      }

      // Filter returns based on active tab
      let returnsToExport = submittedReturns;
      if (activeTab === 'customer') {
        returnsToExport = submittedReturns.filter(returnItem => returnItem.type === 'customer');
      } else if (activeTab === 'supplier') {
        returnsToExport = submittedReturns.filter(returnItem => returnItem.type === 'supplier');
      }

      if (!returnsToExport.length) {
        toast({
          title: isUrdu ? 'انتباہ' : 'Warning',
          description: isUrdu 
            ? 'منتخب کردہ زمرے میں کوئی واپسی دستیاب نہیں ہے۔' 
            : 'No returns available in the selected category.',
          variant: 'destructive'
        });
        return;
      }

      // Create CSV content
      let csvContent = 'data:text/csv;charset=utf-8,';
      
      // Add header row
      const headers = [
        'ID',
        'Type',
        'Name',
        'Company',
        'Date',
        'Time',
        'Medicine Name',
        'Quantity',
        'Price',
        'Reason'
      ];
      csvContent += headers.join(',') + '\r\n';

      // Add data rows
      returnsToExport.forEach(returnItem => {
        returnItem.medicines.forEach(medicine => {
          const row = [
            `"${returnItem.id}"`,
            `"${returnItem.type}"`,
            `"${returnItem.name}"`,
            `"${returnItem.companyName || ''}"`,
            `"${returnItem.date}"`,
            `"${returnItem.time}"`,
            `"${medicine.medicineName}"`,
            `"${medicine.quantity}"`,
            `"${medicine.price}"`,
            `"${medicine.reason || ''}"`
          ];
          csvContent += row.join(',') + '\r\n';
        });
      });

      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `returns_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success message
      toast({
        title: isUrdu ? 'کامیابی' : 'Success',
        description: isUrdu 
          ? 'واپسی کی معلومات CSV فائل میں ایکسپورٹ کر دی گئی ہیں۔' 
          : 'Returns have been exported to CSV file.'
      });
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast({
        title: isUrdu ? 'خرابی' : 'Error',
        description: isUrdu 
          ? 'ڈیٹا برآمد کرتے وقت خرابی آئی ہے' 
          : 'An error occurred while exporting data',
        variant: 'destructive',
      });
    }
  };

  // Function to refresh the page
  const refreshPage = () => {
    window.location.reload();
  };

  // Render return card for the list view
  const renderReturnCard = (returnItem: SubmittedReturn) => {
    const totalItems = returnItem.medicines.reduce((sum, med) => sum + (Number(med.quantity) || 0), 0);
    const totalAmount = returnItem.medicines.reduce(
      (sum, med) => sum + ((Number(med.price) || 0) * (Number(med.quantity) || 0)),
      0
    );

    return (
      <Card key={returnItem.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center">
                {returnItem.type === 'customer' ? (
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                ) : (
                  <Truck className="h-5 w-5 mr-2 text-green-600" />
                )}
                {returnItem.type === 'customer' 
                  ? (isUrdu ? 'گاہک کی واپسی' : 'Customer Return')
                  : (isUrdu ? 'سپلائر کو واپسی' : 'Supplier Return')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {returnItem.name} 
                {returnItem.companyName && ` • ${returnItem.companyName}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {returnItem.date} • {returnItem.time}
              </p>
              <p className="text-sm font-medium">
                {totalItems} {isUrdu ? 'اشیاء' : 'items'} • PKR {totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {returnItem.medicines.map((med, index) => (
              <div key={`${returnItem.id}-${index}`} className="flex justify-between py-1 border-b last:border-0">
                <div>
                  <p className="font-medium">{med.medicineName}</p>
                  <p className="text-sm text-muted-foreground">
                    {med.quantity} x PKR {Number(med.price || 0).toFixed(2)}
                    {med.batchNo && ` • ${isUrdu ? 'بیچ' : 'Batch'}: ${med.batchNo}`}
                    {med.expiryDate && ` • ${isUrdu ? 'میعاد' : 'Expiry'}: ${med.expiryDate}`}
                  </p>
                  {med.reason && (
                    <p className="text-sm text-amber-500 mt-1">
                      <span className="font-medium">{isUrdu ? 'وجہ' : 'Reason'}:</span> {med.reason}
                    </p>
                  )}
                </div>
                <p className="font-medium">PKR {(med.price * med.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.confirm(isUrdu 
                ? 'کیا آپ واقعی اس واپسی کو حذف کرنا چاہتے ہیں؟' 
                : 'Are you sure you want to delete this return?'
              )) {
                handleDeleteReturn(returnItem.id);
              }
            }}
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-4 w-4 mr-1" />
            {isUrdu ? 'حذف کریں' : 'Delete'}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Handle barcode scan result
  const handleBarcodeScanned = (barcode: string) => {
    if (!barcode) return;
    
    // Update the appropriate field based on which form is active
    if (activeScannerFor === 'customer' || activeScannerFor === 'supplier') {
      setMedicineName(barcode);
      setShowBarcodeScanner(false);
      
      // Find the medicine in inventory to auto-fill price if available
      const inventory = getInventory();
      const foundItem = inventory.find(item => 
        item.barcode === barcode || item.name.toLowerCase().includes(barcode.toLowerCase())
      );
      
      if (foundItem) {
        setPrice(foundItem.price);
        toast({
          title: isUrdu ? 'کامیابی' : 'Success',
          description: isUrdu 
            ? 'دوا کی معلومات خودکار طور پر بھر دی گئی ہیں' 
            : 'Medicine details have been auto-filled',
        });
      }
    }
  };

  // Open barcode scanner for the specified form type
  const openBarcodeScanner = (formType: 'customer' | 'supplier') => {
    setActiveScannerFor(formType);
    setShowBarcodeScanner(true);
  };


  // Render customer return form dialog
  const renderCustomerReturnForm = () => {
    const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSubmit('customer', {
        name: medicineName,
        quantity: quantity,
        price: price
      });
    };

    return (
      <Dialog open={showCustomerReturn} onOpenChange={setShowCustomerReturn}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              {isUrdu ? 'گاہک کی واپسی' : 'Customer Return'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customerName" className="text-right">
                  {isUrdu ? 'گاہک کا نام' : 'Customer Name'}
                </Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="border-t pt-4 mt-2">
                <h4 className="text-sm font-medium mb-3">
                  {isUrdu ? 'دوائی کی تفصیلات' : 'Medicine Details'}
                </h4>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-5">
                    <Label htmlFor="medicineName" className="text-sm block mb-1">
                      {isUrdu ? 'دوا کا نام' : 'Medicine Name'}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="medicineName"
                        value={medicineName}
                        onChange={(e) => setMedicineName(e.target.value)}
                        className="flex-1"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => openBarcodeScanner('customer')}
                        title={isUrdu ? 'بار کوڈ اسکین کریں' : 'Scan Barcode'}
                      >
                        <Barcode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="quantity" className="text-sm block mb-1">
                      {isUrdu ? 'تعداد' : 'Quantity'}
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <Label htmlFor="price" className="text-sm block mb-1">
                      {isUrdu ? 'قیمت' : 'Price'}
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value) || 0)}
                      className="w-full"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCustomerReturn(false)}
              >
                {isUrdu ? 'منسوخ کریں' : 'Cancel'}
              </Button>
              <Button 
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isUrdu ? 'واپسی مکمل کریں' : 'Process Return'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  // Render supplier return form dialog
  const renderSupplierReturnForm = () => {
    const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSubmit('supplier', {
        name: medicineName,
        quantity: quantity,
        price: price
      });
    };

    return (
      <Dialog open={showSupplierReturn} onOpenChange={setShowSupplierReturn}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2 text-blue-600" />
              {isUrdu ? 'سپلائر کو واپسی' : 'Supplier Return'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplierName" className="text-right">
                  {isUrdu ? 'سپلائر کا نام' : 'Supplier Name'}
                </Label>
                <Input
                  id="supplierName"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="companyName" className="text-right">
                  {isUrdu ? 'کمپنی کا نام' : 'Company Name'}
                </Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="border-t pt-4 mt-2">
                <h4 className="text-sm font-medium mb-3">
                  {isUrdu ? 'دوائی کی تفصیلات' : 'Medicine Details'}
                </h4>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-5">
                    <Label htmlFor="supplierMedicineName" className="text-sm block mb-1">
                      {isUrdu ? 'دوا کا نام' : 'Medicine Name'}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="supplierMedicineName"
                        value={medicineName}
                        onChange={(e) => setMedicineName(e.target.value)}
                        className="flex-1"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => openBarcodeScanner('supplier')}
                        title={isUrdu ? 'بار کوڈ اسکین کریں' : 'Scan Barcode'}
                      >
                        <Barcode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="supplierQuantity" className="text-sm block mb-1">
                      {isUrdu ? 'تعداد' : 'Quantity'}
                    </Label>
                    <Input
                      id="supplierQuantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <Label htmlFor="supplierPrice" className="text-sm block mb-1">
                      {isUrdu ? 'قیمت' : 'Price'}
                    </Label>
                    <Input
                      id="supplierPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value) || 0)}
                      className="w-full"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowSupplierReturn(false)}
              >
                {isUrdu ? 'منسوخ کریں' : 'Cancel'}
              </Button>
              <Button 
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isUrdu ? 'واپسی مکمل کریں' : 'Process Return'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };
  // Main component return
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Customer Return Dialog */}
      <Dialog open={showCustomerReturn} onOpenChange={setShowCustomerReturn}>
        {renderCustomerReturnForm()}
      </Dialog>
      
      {/* Supplier Return Dialog */}
      <Dialog open={showSupplierReturn} onOpenChange={setShowSupplierReturn}>
        {renderSupplierReturnForm()}
      </Dialog>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isUrdu ? 'واپسیاں' : 'Returns'}
        </h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshPage}
            title={isUrdu ? 'تازہ کریں' : 'Refresh'}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            {isUrdu ? 'تازہ کریں' : 'Refresh'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportReturnsToCSV}
            disabled={submittedReturns.length === 0}
            title={isUrdu ? 'برآمد کریں' : 'Export'}
            ref={exportButtonRef}
          >
            <Download className="h-4 w-4 mr-2" />
            {isUrdu ? 'برآمد کریں' : 'Export'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Customer Return Card */}
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer" 
          onClick={() => setShowCustomerReturn(true)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <User className="h-6 w-6 mr-2" />
              {isUrdu ? 'گاہک کی واپسی' : 'Customer Return'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {isUrdu ? 'گاہک کو واپس کی گئی ادویات' : 'Medicines returned by customer'}
            </p>
          </CardContent>
        </Card>

        {/* Supplier Return Card */}
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer" 
          onClick={() => setShowSupplierReturn(true)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Truck className="h-6 w-6 mr-2" />
              {isUrdu ? 'سپلائر کو واپسی' : 'Supplier Return'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {isUrdu ? 'سپلائر کو واپس بھیجی گئی ادویات' : 'Medicines returned to supplier'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Submitted Returns Section */}
      {submittedReturns.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">
            {isUrdu ? 'جمع کرائی گئی معلومات' : 'Submitted Information'}
          </h3>
          
          {/* Tabs */}
          <div className="flex border-b mb-4">
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('all')}
            >
              {isUrdu ? 'تمام واپسیاں' : 'All Returns'}
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'customer' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('customer')}
            >
              {isUrdu ? 'گاہک کی واپسیاں' : 'Customer Returns'}
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'supplier' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('supplier')}
            >
              {isUrdu ? 'سپلائر کو واپسیاں' : 'Supplier Returns'}
            </button>
          </div>
          
          {/* All Returns */}
          <div className={activeTab === 'all' ? 'block' : 'hidden'}>
            {submittedReturns.length > 0 ? (
              <div className="space-y-4">
                {submittedReturns.map((item) => (
                  <div key={item.id}>
                    {renderReturnCard(item)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {isUrdu ? 'کوئی واپسی دستیاب نہیں ہے' : 'No returns available'}
              </p>
            )}
          </div>
          
          {/* Customer Returns */}
          <div className={activeTab === 'customer' ? 'block' : 'hidden'}>
            {submittedReturns.filter(item => item.type === 'customer').length > 0 ? (
              <div className="space-y-4">
                {submittedReturns
                  .filter(item => item.type === 'customer')
                  .map((item) => (
                    <div key={item.id}>
                      {renderReturnCard(item)}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {isUrdu ? 'کوئی گاہک کی واپسی دستیاب نہیں' : 'No customer returns available'}
              </p>
            )}
          </div>
          
          {/* Supplier Returns */}
          <div className={activeTab === 'supplier' ? 'block' : 'hidden'}>
            {submittedReturns.filter(item => item.type === 'supplier').length > 0 ? (
              <div className="space-y-4">
                {submittedReturns
                  .filter(item => item.type === 'supplier')
                  .map((item) => (
                    <div key={item.id}>
                      {renderReturnCard(item)}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {isUrdu ? 'کوئی سپلائر کو واپسی دستیاب نہیں' : 'No supplier returns available'}
              </p>
            )}
          </div>
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

export default ReturnsPage;
