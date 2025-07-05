import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AddStockModal } from './AddStockModal';
import { medicineService } from '@/services/medicineService';

type Medicine = {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  price: number;
  lastPurchasePrice?: number;
  lastSupplierId?: string;
  lastPurchaseDate?: string;
  batchNumber?: string;
};

export function MedicineList() {
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Fetch medicines from backend API
  React.useEffect(() => {
    async function fetchInventory() {
      try {
        const inventory = await import('@/api/backend').then(mod => mod.getInventory());
        setMedicines(inventory);
      } catch (error) {
        setMedicines([]);
        // Optionally show error toast or message
      }
    }
    fetchInventory();
  }, []);

  const handleAddStock = async (medicineId: string, data: {
    quantity: number;
    purchasePrice: number;
    invoiceNumber: string;
    supplierId: string;
    batchNumber: string;
  }) => {
    try {
      await medicineService.addStock(medicineId, data);
      
      // Update local state optimistically
      setMedicines(prev => prev.map(med => {
        if (med.id === medicineId) {
          return {
            ...med,
            currentStock: med.currentStock + data.quantity,
            lastPurchasePrice: data.purchasePrice,
            lastSupplierId: data.supplierId,
            lastPurchaseDate: new Date().toISOString(),
            batchNumber: data.batchNumber
          };
        }
        return med;
      }));
    } catch (error) {
      console.error('Failed to add stock:', error);
      // TODO: Show error toast
    }
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search medicines..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Medicine
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Last Purchase</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedicines.map(medicine => (
              <tr key={medicine.id} className="border-b">
                <td className="p-3">{medicine.name}</td>
                <td className="p-3">{medicine.category}</td>
                <td className="p-3">{medicine.currentStock}</td>
                <td className="p-3">Rs. {medicine.price.toFixed(2)}</td>
                <td className="p-3">
                  {medicine.lastPurchasePrice ? `Rs. ${medicine.lastPurchasePrice.toFixed(2)}` : 'N/A'}
                </td>
                <td className="p-3">
                  <AddStockModal 
                    medicine={medicine} 
                    onAddStock={(data) => handleAddStock(medicine.id, data)}
                  >
                    <Button variant="ghost" size="sm">
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Stock
                    </Button>
                  </AddStockModal>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
