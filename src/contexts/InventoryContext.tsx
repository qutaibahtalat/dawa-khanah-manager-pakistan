import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getInventory, addInventory, updateInventory, deleteInventory } from '@/api/backend';
import type { InventoryItem } from '@/utils/inventoryService';

interface InventoryContextType {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  refreshInventory: () => Promise<void>;
  updateItemInInventory: (id: number, updates: Partial<InventoryItem>) => Promise<void>;
  addItemToInventory: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  removeItemFromInventory: (id: number) => Promise<void>;
}

export const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const refreshInventory = async () => {
    try {
      const data = await getInventory(); // Fetch from backend
      setInventory(data);
    } catch (error) {
      console.error('Failed to refresh inventory:', error);
    }
  };

  const updateItemInInventory = async (id: number, updates: Partial<InventoryItem>) => {
    try {
      await updateInventory(id, updates);
      await refreshInventory();
    } catch (error) {
      console.error('Failed to update item in inventory:', error);
      throw error;
    }
  };

  const addItemToInventory = async (item: Omit<InventoryItem, 'id'>) => {
    try {
      await addInventory(item);
      await refreshInventory();
    } catch (error) {
      console.error('Failed to add item to inventory:', error);
      throw error;
    }
  };

  const removeItemFromInventory = async (id: number) => {
    try {
      await deleteInventory(id);
      await refreshInventory();
    } catch (error) {
      console.error('Failed to remove item from inventory:', error);
      throw error;
    }
  };


  // Load inventory on mount
  useEffect(() => {
    refreshInventory();
  }, []);

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        setInventory,
        refreshInventory,
        updateItemInInventory,
        addItemToInventory,
        removeItemFromInventory,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export function useInventory(): InventoryContextType {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
