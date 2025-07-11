import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useProfitData } from '@/hooks/useProfitData';

export function ProfitWidget() {
  const { monthlyProfit, isLoading } = useProfitData();
  
  const formattedProfit = useMemo(() => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(monthlyProfit);
  }, [monthlyProfit]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Monthly Profit
        </CardTitle>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedProfit}</div>
        <p className="text-xs text-muted-foreground">
          {isLoading ? 'Loading...' : new Date().toLocaleString('default', { month: 'long' })}
        </p>
      </CardContent>
    </Card>
  );
}
