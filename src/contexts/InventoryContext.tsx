import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getInventory, saveInventory, InventoryItem } from '@/utils/inventoryService';

interface InventoryContextType {
  inventory: InventoryItem[];
  refreshInventory: () => Promise<void>;
  updateItemInInventory: (id: number, updates: Partial<InventoryItem>) => Promise<void>;
  addItemToInventory: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  removeItemFromInventory: (id: number) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const refreshInventory = async () => {
    try {
      const data = await getInventory();
      setInventory(data);
    } catch (error) {
      console.error('Failed to refresh inventory:', error);
    }
  };

  const updateItemInInventory = async (id: number, updates: Partial<InventoryItem>) => {
    try {
      const updatedInventory = inventory.map(item => 
        item.id === id ? { ...item, ...updates, id } : item
      );
      await saveInventory(updatedInventory);
      setInventory(updatedInventory);
    } catch (error) {
      console.error('Failed to update item in inventory:', error);
      throw error;
    }
  };

  const addItemToInventory = async (item: Omit<InventoryItem, 'id'>) => {
    try {
      const newItem = { ...item, id: Date.now() };
      const updatedInventory = [...inventory, newItem];
      await saveInventory(updatedInventory);
      setInventory(updatedInventory);
    } catch (error) {
      console.error('Failed to add item to inventory:', error);
      throw error;
    }
  };

  const removeItemFromInventory = async (id: number) => {
    try {
      const updatedInventory = inventory.filter(item => item.id !== id);
      await saveInventory(updatedInventory);
      setInventory(updatedInventory);
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

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
