import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuditLog } from './AuditLogContext';

export type Expense = {
  id: string;
  date: string;
  type: 'Rent' | 'Utilities' | 'Salaries' | 'Supplies' | 'Marketing' | 'Maintenance' | 'Insurance' | 'Taxes' | 'Other';
  amount: number;
  notes: string;
};

export type Sale = {
  id: string;
  date: string;
  items: Array<{
    medicineId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  customerId?: string;
};

type DataContextType = {
  expenses: Expense[];
  sales: Sale[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  getExpensesByDateRange: (from: string, to: string) => Expense[];
  addSale: (sale: Omit<Sale, 'id'>) => void;
  updateSale: (id: string, sale: Omit<Sale, 'id'>) => void;
  deleteSale: (id: string) => void;
  getSalesByDateRange: (from: string, to: string) => Sale[];
};

const DataContext = createContext<DataContextType>({} as DataContextType);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const { logAction } = useAuditLog();

  // Load initial data
  useEffect(() => {
    const loadData = () => {
      try {
        const storedExpenses = localStorage.getItem('pharmacy_expenses');
        if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
        const storedSales = localStorage.getItem('pharmacy_sales');
        if (storedSales) setSales(JSON.parse(storedSales));
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    loadData();
  }, []);

  // Save data when changed
  useEffect(() => {
    localStorage.setItem('pharmacy_expenses', JSON.stringify(expenses));
    localStorage.setItem('pharmacy_sales', JSON.stringify(sales));
  }, [expenses, sales]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: Date.now().toString() };
    setExpenses(prev => [...prev, newExpense]);
    logAction('EXPENSE_ADD', `Added expense: ${expense.type} (PKR ${expense.amount})`);
  };

  const updateExpense = (id: string, expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...expense, id } : e));
    logAction('EXPENSE_UPDATE', `Updated expense: ${expense.type} (PKR ${expense.amount})`);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    logAction('EXPENSE_DELETE', `Deleted expense ID: ${id}`);
  };

  const getExpensesByDateRange = (from: string, to: string) => {
    return expenses.filter(e => e.date >= from && e.date <= to);
  };

  const addSale = (sale: Omit<Sale, 'id'>) => {
    const newSale = { ...sale, id: Date.now().toString() };
    setSales(prev => [...prev, newSale]);
    logAction('SALE_ADD', `Added sale: PKR ${sale.total}`);
  };

  const updateSale = (id: string, sale: Omit<Sale, 'id'>) => {
    setSales(prev => prev.map(s => s.id === id ? { ...sale, id } : s));
    logAction('SALE_UPDATE', `Updated sale: PKR ${sale.total}`);
  };

  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(s => s.id !== id));
    logAction('SALE_DELETE', `Deleted sale ID: ${id}`);
  };

  const getSalesByDateRange = (from: string, to: string) => {
    return sales.filter(s => s.date >= from && s.date <= to);
  };

  return (
    <DataContext.Provider value={{
      expenses,
      sales,
      addExpense,
      updateExpense,
      deleteExpense,
      getExpensesByDateRange,
      addSale,
      updateSale,
      deleteSale,
      getSalesByDateRange
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
