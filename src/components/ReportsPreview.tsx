import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Printer } from 'lucide-react';

// Placeholder for backend integration
const fetchReportData = async (type: string, filter: any) => {
  // TODO: Replace with real API call
  return {
    totalSales: 12345,
    totalPurchases: 6789,
    totalProfit: 5556,
    items: [
      { name: 'Paracetamol', sales: 1000, purchases: 800, profit: 200 },
      { name: 'Ibuprofen', sales: 2000, purchases: 1700, profit: 300 },
    ],
  };
};

const ReportsPreview: React.FC = () => {
  const [tab, setTab] = useState('daily');
  const [filter, setFilter] = useState({ supplier: '', product: '' });
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    setReport(await fetchReportData(tab, filter));
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto print:bg-white">
      <Card className="mb-6 shadow-lg print:shadow-none print:border-0">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-blue-700 mb-1 print:text-black print:mb-0">Reports</CardTitle>
          <div className="text-gray-500 text-lg font-medium print:text-black">Sales, Purchase & Profit Overview</div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <Tabs value={tab} onValueChange={setTab} className="mb-0">
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-2">
              <Input
                placeholder="Supplier/Distributor"
                value={filter.supplier}
                onChange={e => setFilter(f => ({ ...f, supplier: e.target.value }))}
                className="w-44"
              />
              <Input
                placeholder="Product"
                value={filter.product}
                onChange={e => setFilter(f => ({ ...f, product: e.target.value }))}
                className="w-44"
              />
              <Button onClick={handleFetch} disabled={loading}>
                {loading ? 'Loading...' : 'Preview'}
              </Button>
            </div>
          </div>
          {report && (
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-6 print:bg-white print:p-0">
              <div className="flex flex-wrap gap-8 mb-6 justify-center print:justify-start">
                <div className="text-xl font-semibold text-gray-700 print:text-black">
                  <span className="block text-sm font-normal text-gray-400 print:text-black">Total Sales</span>
                  <span className="text-2xl font-bold text-blue-600 print:text-black">{report.totalSales}</span>
                </div>
                <div className="text-xl font-semibold text-gray-700 print:text-black">
                  <span className="block text-sm font-normal text-gray-400 print:text-black">Total Purchases</span>
                  <span className="text-2xl font-bold text-green-600 print:text-black">{report.totalPurchases}</span>
                </div>
                <div className="text-xl font-semibold text-gray-700 print:text-black">
                  <span className="block text-sm font-normal text-gray-400 print:text-black">Total Profit</span>
                  <span className="text-2xl font-bold text-purple-600 print:text-black">{report.totalProfit}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 mb-2 print:hidden">
                <Button variant="outline" onClick={() => window.print()} className="border-blue-600 text-blue-700 hover:bg-blue-50">
                  <Printer className="w-4 h-4 mr-2" /> Print
                </Button>
                <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
              </div>
              <div className="overflow-x-auto rounded-xl border print:border-0 bg-white print:bg-white">
                <table className="w-full min-w-[480px] border-collapse print:text-black">
                  <thead>
                    <tr className="bg-blue-100 print:bg-white">
                      <th className="px-4 py-2 border-b text-left text-lg font-bold text-blue-800 print:text-black">Product</th>
                      <th className="px-4 py-2 border-b text-left text-lg font-bold text-blue-800 print:text-black">Sales</th>
                      <th className="px-4 py-2 border-b text-left text-lg font-bold text-blue-800 print:text-black">Purchases</th>
                      <th className="px-4 py-2 border-b text-left text-lg font-bold text-blue-800 print:text-black">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.items.map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="border px-2 py-1">{item.name}</td>
                        <td className="border px-2 py-1">{item.sales}</td>
                        <td className="border px-2 py-1">{item.purchases}</td>
                        <td className="border px-2 py-1">{item.profit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPreview;
