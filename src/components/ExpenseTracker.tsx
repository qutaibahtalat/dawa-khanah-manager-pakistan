
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  DollarSign, 
  Calendar,
  FileText,
  TrendingDown,
  Search
} from 'lucide-react';

interface ExpenseTrackerProps {
  isUrdu: boolean;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ isUrdu }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const text = {
    en: {
      title: 'Expense Tracker',
      addExpense: 'Add New Expense',
      date: 'Date',
      expenseType: 'Expense Type',
      amount: 'Amount (PKR)',
      notes: 'Notes',
      save: 'Save Expense',
      cancel: 'Cancel',
      totalExpenses: 'Total Expenses',
      thisMonth: 'This Month',
      searchPlaceholder: 'Search expenses...',
      rent: 'Rent',
      utilities: 'Utilities',
      salaries: 'Salaries',
      supplies: 'Supplies',
      other: 'Other'
    },
    ur: {
      title: 'اخراجات کا ٹریکر',
      addExpense: 'نیا خرچ شامل کریں',
      date: 'تاریخ',
      expenseType: 'خرچ کی قسم',
      amount: 'رقم (PKR)',
      notes: 'نوٹس',
      save: 'خرچ محفوظ کریں',
      cancel: 'منسوخ',
      totalExpenses: 'کل اخراجات',
      thisMonth: 'اس مہینے',
      searchPlaceholder: 'اخراجات تلاش کریں...',
      rent: 'کرایہ',
      utilities: 'بجلی پانی',
      salaries: 'تنخواہیں',
      supplies: 'سامان',
      other: 'دیگر'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Sample expense data
  const expenses = [
    {
      id: 1,
      date: '2024-06-10',
      type: 'Rent',
      amount: 50000,
      notes: 'Monthly shop rent'
    },
    {
      id: 2,
      date: '2024-06-09',
      type: 'Utilities',
      amount: 8500,
      notes: 'Electricity bill'
    },
    {
      id: 3,
      date: '2024-06-08',
      type: 'Salaries',
      amount: 75000,
      notes: 'Staff salaries for June'
    },
    {
      id: 4,
      date: '2024-06-05',
      type: 'Supplies',
      amount: 12000,
      notes: 'Medicine packaging supplies'
    }
  ];

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const filteredExpenses = expenses.filter(expense =>
    expense.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getExpenseTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'rent': return 'destructive';
      case 'utilities': return 'secondary';
      case 'salaries': return 'default';
      case 'supplies': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t.addExpense}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t.totalExpenses}</p>
                <p className="text-3xl font-bold text-red-600">PKR {totalExpenses.toLocaleString()}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t.thisMonth}</p>
                <p className="text-3xl font-bold text-orange-600">PKR {totalExpenses.toLocaleString()}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Daily</p>
                <p className="text-3xl font-bold text-blue-600">PKR {Math.round(totalExpenses / 30).toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{t.addExpense}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expenseDate">{t.date}</Label>
                <Input id="expenseDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseType">{t.expenseType}</Label>
                <select className="w-full px-3 py-2 border border-input rounded-md bg-background">
                  <option value="Rent">{t.rent}</option>
                  <option value="Utilities">{t.utilities}</option>
                  <option value="Salaries">{t.salaries}</option>
                  <option value="Supplies">{t.supplies}</option>
                  <option value="Other">{t.other}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">{t.amount}</Label>
                <Input id="amount" type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">{t.notes}</Label>
                <Input id="notes" placeholder="Enter details..." />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                {t.cancel}
              </Button>
              <Button onClick={() => setShowAddForm(false)}>
                {t.save}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Recent Expenses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getExpenseTypeColor(expense.type) as any}>
                        {expense.type}
                      </Badge>
                      <span className="text-sm text-gray-500">{expense.date}</span>
                    </div>
                    <p className="font-medium text-gray-900">{expense.notes}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">PKR {expense.amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseTracker;
