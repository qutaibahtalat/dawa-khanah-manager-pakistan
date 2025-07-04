import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { medicineService } from '@/services/medicineService';
import Papa from 'papaparse';

export function BulkImport() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    
    try {
      setIsLoading(true);
      
      // Parse CSV file
      const results = await new Promise<any[]>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          complete: (results) => resolve(results.data),
          error: (error) => reject(error)
        });
      });
      
      // Validate and import medicines
      const importedMedicines = results
        .map(row => ({
          id: `med_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name: row.name || '',
          manufacturer: row.manufacturer || '',
          price: parseFloat(row.price) || 0,
          quantity: parseInt(row.quantity) || 0,
          category: row.category || '',
          expiryDate: row.expiryDate || '',
          batchNumber: row.batchNumber || ''
        }))
        .filter(med => med.name);
      
      if (importedMedicines.length === 0) {
        throw new Error('No valid medicines found in file');
      }
      
      // TODO: Actually save to database via medicineService
      // For now just log to console
      console.log('Medicines to import:', importedMedicines);
      
      toast({
        title: 'Bulk Import Successful',
        description: `Imported ${importedMedicines.length} medicines`,
      });
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'There was an error importing medicines',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setFile(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="bulk-import">CSV File</Label>
        <Input 
          id="bulk-import" 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
        />
        <p className="text-sm text-muted-foreground mt-1">
          CSV should include: name, manufacturer, price, quantity, category, expiryDate, batchNumber
        </p>
      </div>
      
      <Button 
        onClick={handleSubmit}
        disabled={!file || isLoading}
      >
        {isLoading ? 'Importing...' : 'Import Medicines'}
      </Button>
    </div>
  );
}
