import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { getMedicineSuggestions, loadMedicineDatabase } from '@/utils/MedicineSuggestions';
import { ChevronsUpDown } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface MedicineEditFormProps {
  item: any;
  formData: any;
  setFormData: (data: any) => void;
  isUrdu: boolean;
  distributors: { companyName: string }[];
  categories: string[];
  medicines: Array<{id: number, name: string, category: string, batchNo: string, stock: number, minStock: number, maxStock: number, purchasePrice: number, salePrice: number}>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: any) => void;
  onCancel: () => void;
  onAddDistributor: () => void;
  isAddMode?: boolean;
}

export const MedicineEditForm = ({
  item,
  formData,
  setFormData,
  isUrdu,
  distributors,
  categories,
  medicines,
  onInputChange,
  onSubmit,
  onCancel,
  onAddDistributor,
  isAddMode
}: MedicineEditFormProps) => {
  const [localFormData, setLocalFormData] = useState(formData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState<Array<{id: number, name: string, category: string, batchNo: string, stock: number, minStock: number, maxStock: number, purchasePrice: number, salePrice: number}>>(medicines || []);
  const [suggestions, setSuggestions] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLocalFormData(formData);
  }, [formData]);

  useEffect(() => {
    if (!medicines) return;
    
    if (searchTerm.trim() === '') {
      setFilteredMedicines(medicines);
    } else {
      setFilteredMedicines(
        medicines.filter(med => 
          med.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, medicines]);

  useEffect(() => {
    const loadDatabase = async () => {
      try {
        // For development, serve the CSV from public folder
        await loadMedicineDatabase('/medicine-database.csv');
      } catch (error) {
        console.error('Failed to load medicine database:', error);
      }
    };
    loadDatabase();
  }, []);

  useEffect(() => {
    if (item?.id && medicines.length > 0) {
      const medicine = medicines.find(m => m.id === item.id);
      if (medicine) {
        setLocalFormData(prev => ({
          ...prev,
          name: medicine.name,
          category: medicine.category
        }));
      }
    }
  }, [item, medicines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    const requiredFields = ['name', 'stock', 'unitPrice', 'salePrice'];
    const missingFields = requiredFields.filter(field => !localFormData[field]);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Error',
        description: `Please fill all required fields: ${missingFields.join(', ')}`,
        variant: 'destructive'
      });
      return;
    }
    
    // Convert numeric fields
    const submissionData = {
      ...localFormData,
      unitPrice: Number(localFormData.unitPrice),
      salePrice: Number(localFormData.salePrice),
      stock: Number(localFormData.stock),
      minStock: Number(localFormData.minStock || 0),
      maxStock: Number(localFormData.maxStock || 0)
    };
    
    onSubmit(submissionData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (value === 'add_new_distributor') {
      onAddDistributor();
    } else {
      handleInputChange({ target: { name, value } });
    }
  };

  const handleMedicineSelect = (medicineId: number) => {
    const selectedMedicine = medicines.find(m => m.id === medicineId);
    if (selectedMedicine) {
      const newFormData = {
        ...localFormData,
        medicineId,
        name: selectedMedicine.name,
        category: selectedMedicine.category,
        batchNo: selectedMedicine.batchNo,
        stock: selectedMedicine.stock,
        minStock: selectedMedicine.minStock,
        maxStock: selectedMedicine.maxStock,
        unitPrice: selectedMedicine.purchasePrice,
        salePrice: selectedMedicine.salePrice
      };
      setLocalFormData(newFormData);
      setFormData(newFormData);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSuggestions(getMedicineSuggestions(query));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-6 p-6 bg-white rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Name Field */}
        <div className="md:col-span-2">
          <Label>Medicine Name</Label>
          <Input value={localFormData.name} readOnly className="w-full" />
        </div>
        
        {/* Category Field */}
        <div>
          <Label>Category</Label>
          <Select value={localFormData.category || ''} onValueChange={(value) => handleSelectChange('category', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Unit Purchase Price Field */}
        <div>
          <Label>Unit Purchase Price</Label>
          <Input
            type="number"
            name="unitPrice"
            value={localFormData.unitPrice || ''}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        
        {/* Total Stock Field */}
        <div>
          <Label>Total Stock</Label>
          <Input
            type="number"
            name="stock"
            value={localFormData.stock || ''}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        
        {/* Total Purchase Price Field */}
        <div>
          <Label>Total Purchase Price</Label>
          <Input
            type="number"
            value={(localFormData.stock * localFormData.unitPrice).toFixed(2)}
            readOnly
            className="w-full"
          />
        </div>
        
        {/* Sale Price Field */}
        <div>
          <Label>Sale Price</Label>
          <Input
            type="number"
            name="salePrice"
            value={localFormData.salePrice || ''}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        
        {/* Stock Value Field */}
        <div>
          <Label>Stock Value</Label>
          <Input
            type="number"
            value={(localFormData.stock * localFormData.salePrice).toFixed(2)}
            readOnly
            className="w-full"
          />
        </div>
      </div>
      
      {/* Form actions */}
      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isAddMode ? 'Add Medicine' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
