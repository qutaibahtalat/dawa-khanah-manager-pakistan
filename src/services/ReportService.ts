import API_ENDPOINTS from '../utils/apiConfig';
import { InventoryService } from './InventoryService';
import { POSService } from './POSService';

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

interface ReportParams {
  period: TimePeriod;
  startDate?: Date;
  endDate?: Date;
}

export const ReportService = {
  async getProfitReport(params: ReportParams): Promise<{sales: number, costs: number, profit: number}> {
    // Get sales data
    const salesResponse = await fetch(`${API_ENDPOINTS.REPORTS}/sales?period=${params.period}`);
    const salesData = await salesResponse.json();
    
    // Get purchase costs
    const costsResponse = await fetch(`${API_ENDPOINTS.REPORTS}/costs?period=${params.period}`);
    const costsData = await costsResponse.json();
    
    return {
      sales: salesData.total,
      costs: costsData.total,
      profit: salesData.total - costsData.total
    };
  },
  
  async getInventoryReport(): Promise<any> {
    const inventory = await InventoryService.getInventory();
    return inventory;
  },
  
  async getSalesReport(params: ReportParams): Promise<any> {
    return POSService.getCustomerHistory('all');
  }
};
