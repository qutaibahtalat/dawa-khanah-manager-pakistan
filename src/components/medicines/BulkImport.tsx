import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export function BulkImport() {
  const [isImporting, setIsImporting] = React.useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImporting(true);
      // TODO: Implement actual import logic
      setTimeout(() => {
        setIsImporting(false);
        alert(`${file.name} imported successfully!`);
      }, 2000);
    }
  };

  return (
    <div className="mt-8 p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-4">Bulk Import Medicines</h3>
      <div className="flex items-center space-x-4">
        <label>
          <input 
            type="file" 
            className="hidden" 
            accept=".csv,.xlsx"
            onChange={handleFileUpload}
          />
          <Button asChild>
            <span>
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? 'Importing...' : 'Select File'}
            </span>
          </Button>
        </label>
        <span className="text-sm text-muted-foreground">
          Supports CSV or Excel files
        </span>
      </div>
    </div>
  );
}
