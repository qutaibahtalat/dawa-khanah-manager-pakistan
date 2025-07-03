import { Expense, Sale } from '../contexts/DataContext';

export const fetchRealTimeAnalytics = async () => {
  try {
    // Fetch real data from your backend/localStorage
    const salesData = JSON.parse(localStorage.getItem('sales') || '[]');
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const products = JSON.parse(localStorage.getItem('medicines') || '[]');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');

    // Process data for real-time analytics
    const totalSales = salesData.reduce((sum: number, sale: Sale) => sum + sale.total, 0);
    const totalExpenses = expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
    const netProfit = totalSales - totalExpenses;
    
    return {
      salesData,
      totalSales,
      totalExpenses,
      netProfit,
      profitMargin: totalSales > 0 ? (netProfit / totalSales) * 100 : 0,
      topProducts: [...products].sort((a, b) => b.sold - a.sold).slice(0, 5),
      activeCustomers: customers.length,
      newCustomers: customers.filter((c: any) => {
        const joinDate = new Date(c.joinDate);
        const monthStart = new Date();
        monthStart.setDate(1);
        return joinDate >= monthStart;
      }).length
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
};
