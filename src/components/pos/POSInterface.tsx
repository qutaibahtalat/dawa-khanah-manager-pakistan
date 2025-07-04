import React from 'react';
import { Medicine } from '@/types/medicine';

type POSInterfaceProps = {
  medicines: Medicine[];
  onAddToCart: (medicine: Medicine) => void;
};

export function POSInterface({ medicines, onAddToCart }: POSInterfaceProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {medicines.map(medicine => (
        <div 
          key={medicine.id} 
          className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => onAddToCart(medicine)}
        >
          <h3 className="font-medium">{medicine.name}</h3>
          <p className="text-sm text-gray-600">{medicine.category}</p>
          <p className="text-sm">Rs. {medicine.price.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Stock: {medicine.currentStock}</p>
        </div>
      ))}
    </div>
  );
}
