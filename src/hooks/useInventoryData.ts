import { useEffect, useState } from 'react';
import { inventoryService } from '@/services/inventoryService';

export function useInventoryData() {
  const [totalItems, setTotalItems] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // TODO: Implement actual inventory data fetching
        // For now using mock data
        setTotalItems(1243);
        setLowStockItems(42);
      } catch (error) {
        console.error('Failed to fetch inventory data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Set up refresh interval
    const interval = setInterval(fetchData, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  return { totalItems, lowStockItems, isLoading };
}
