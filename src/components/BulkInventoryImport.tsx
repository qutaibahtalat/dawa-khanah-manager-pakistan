import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import Papa from 'papaparse';
import { medicineServiceBackend } from '@/services/medicineService.backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

interface BulkInventoryImportProps {
  onImportComplete?: () => void;
}

const BulkInventoryImport: React.FC<BulkInventoryImportProps> = ({ onImportComplete }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<Array<any>>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const results = Papa.parse(csvData, { header: true });
        setPreviewData(results.data);
        setShowPreview(true);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to parse CSV file',
          variant: 'destructive'
        });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleImportConfirm = async () => {
    try {
      setIsImporting(true);
      const items = previewData.map((row) => ({
        name: row["Medicine Name"] || '',
        category: row["Category"] || '',
        price: Number(row["Unit Price"]) || 0,
        stock: Number(row["Stock"]) || 0,
      })).filter(item => item.name);
      
      if (items.length === 0) {
        throw new Error('No valid items found in CSV');
      }

      const result = await medicineServiceBackend.bulkImportMedicines(items);
      
      if (result.errors.length > 0) {
        toast({
          title: 'Partial Import',
          description: `Imported: ${result.imported}\nFailed: ${result.failed}\n` + 
            result.errors.map((e, i) => `#${i + 1}: ${e.item?.name || 'Unknown'} — ${e.error}`).join('\n'),
          variant: 'destructive',
          duration: 10000
        });
      } else {
        toast({
          title: 'Success',
          description: `${result.imported} items imported successfully`,
          variant: 'default'
        });
      }
      
      if (typeof onImportComplete === 'function') onImportComplete();
      setShowPreview(false);
    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description: error.message || 'Unknown error during import',
        variant: 'destructive',
        duration: 10000
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <Input
        ref={inputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={isImporting}
      >
        {isImporting ? 'Importing...' : 'Bulk Import'}
      </Button>
      {showPreview && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col" aria-describedby="bulk-import-description">
            <div id="bulk-import-description" className="sr-only">
              Dialog for importing multiple inventory items at once via CSV file
            </div>
            <DialogHeader>
              <DialogTitle>Preview Import ({previewData.length} items)</DialogTitle>
              <div className="text-sm text-muted-foreground">
                Review the data before importing
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-auto border rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    {Object.keys(previewData[0] || {}).map(key => (
                      <TableHead key={key} className="whitespace-nowrap">{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((item, index) => (
                    <TableRow key={index}>
                      {Object.values(item).map((value, i) => (
                        <TableCell key={i} className="max-w-[200px] truncate">
                          {String(value)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Cancel
              </Button>
              <Button onClick={handleImportConfirm} disabled={isImporting}>
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : 'Confirm Import'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default BulkInventoryImport;
