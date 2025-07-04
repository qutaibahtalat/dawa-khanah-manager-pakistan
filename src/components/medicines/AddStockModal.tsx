import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Medicine } from '@/types/medicine';

type AddStockModalProps = {
  medicine: Medicine;
  onAddStock: (data: {
    quantity: number;
    purchasePrice: number;
    invoiceNumber: string;
    supplierId: string;
    batchNumber: string;
  }) => Promise<void>;
  children: React.ReactNode;
};

export const AddStockModal: React.FC<AddStockModalProps> = ({
  medicine,
  onAddStock,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(medicine.lastPurchasePrice || 0);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (quantity <= 0 || purchasePrice <= 0) {
      toast({
        title: 'Invalid Input',
        description: 'Quantity and price must be greater than zero',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await onAddStock({
        quantity,
        purchasePrice,
        invoiceNumber,
        supplierId,
        batchNumber,
      });
      
      toast({
        title: 'Stock Added',
        description: `${quantity} units added to ${medicine.name}`,
      });
      
      setOpen(false);
      setQuantity(0);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add stock',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Stock to {medicine.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          
          <div>
            <Label htmlFor="purchasePrice">Purchase Price (Rs.)</Label>
            <Input
              id="purchasePrice"
              type="number"
              min="0.01"
              step="0.01"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
            />
          </div>
          
          <div>
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="supplierId">Supplier ID</Label>
            <Input
              id="supplierId"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="batchNumber">Batch Number</Label>
            <Input
              id="batchNumber"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
            />
          </div>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Stock'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
