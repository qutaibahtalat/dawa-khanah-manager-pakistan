import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export const InventoryReviewTab = () => {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medicine</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Purchase Price</TableHead>
            <TableHead>Sale Price</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Bonus</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Will be populated with pending inventory items */}
        </TableBody>
      </Table>
    </div>
  );
};
