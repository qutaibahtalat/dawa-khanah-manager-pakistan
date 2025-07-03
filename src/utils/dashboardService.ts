import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/config/firebase';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

/**
 * Get today's total sales
 */
export const getTodaySales = async (): Promise<number> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const salesRef = collection(db, 'sales');
    const q = query(salesRef, where('date', '>=', today));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.reduce((total, doc) => {
      return total + (doc.data().amount || 0);
    }, 0);
  } catch (error) {
    console.error('Error fetching today\'s sales:', error);
    return 0;
  }
};

/**
 * Get total inventory count
 */
export const getTotalInventory = async (): Promise<number> => {
  try {
    const inventoryRef = collection(db, 'inventory');
    const querySnapshot = await getDocs(inventoryRef);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error fetching total inventory:', error);
    return 0;
  }
};

/**
 * Get count of low stock items (stock < threshold)
 */
export const getLowStockItems = async (threshold = 10): Promise<number> => {
  try {
    const inventoryRef = collection(db, 'inventory');
    const q = query(
      inventoryRef,
      where('stock', '<=', threshold)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    return 0;
  }
};

/**
 * Get monthly profit (sales - expenses for current month)
 */
export const getMonthlyProfit = async (): Promise<number> => {
  try {
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
    
    // Get total expenses
    const expensesRef = collection(db, 'expenses');
    const expensesQ = query(
      expensesRef,
      where('date', '>=', firstDay)
    );
    
    const expensesSnapshot = await getDocs(expensesQ);
    const totalExpenses = expensesSnapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().amount || 0);
    }, 0);
    
    return totalSales - totalExpenses;
  } catch (error) {
    console.error('Error calculating monthly profit:', error);
    return 0;
  }
};
