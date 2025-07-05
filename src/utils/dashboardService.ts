// Firebase/Firestore removed. All dashboard metrics now stubbed or should use local backend API.

/**
 * Get today's total sales
 */
// All dashboardService functions are now stubs. Replace with backend API calls as needed.

export const getTodaySales = async (): Promise<number> => {
  return 0;
};

export const getTotalInventory = async (): Promise<number> => {
  return 0;
};

export const getLowStockItems = async (threshold = 10): Promise<number> => {
  return 0;
};

/**
 * Get monthly profit (sales - expenses for current month)
 */
export const getMonthlyProfit = async (): Promise<number> => {
  return 0;
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get total sales
    const salesRef = collection(db, 'sales');
    const salesQ = query(
      salesRef,
      where('date', '>=', firstDay)
    );
    
    const salesSnapshot = await getDocs(salesQ);
    const totalSales = salesSnapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().amount || 0);
    }, 0);
    
  return 0;
};
