import React from 'react';
import { MedicineList } from '@/components/medicines/MedicineList';
import { BulkImport } from '@/components/medicines/BulkImport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvoiceTrackingComponent } from '@/components/medicines/InvoiceTracking';
import { medicineService } from '@/services/medicineService';

export function MedicineManagementPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Medicine Management</h1>
      
      <Tabs defaultValue="medicines">
        <TabsList>
          <TabsTrigger value="medicines">Medicines</TabsTrigger>
          <TabsTrigger value="invoiceTracking">Track by Invoice</TabsTrigger>
          <TabsTrigger value="bulkImport">Bulk Import</TabsTrigger>
        </TabsList>
        
        <TabsContent value="medicines">
          <MedicineList />
        </TabsContent>
        
        <TabsContent value="invoiceTracking">
          <InvoiceTrackingComponent onTrack={medicineService.trackByInvoice} />
        </TabsContent>
        
        <TabsContent value="bulkImport">
          <BulkImport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
