
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, 
  FileText, 
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Building,
  Calendar
} from 'lucide-react';

interface TaxModuleProps {
  isUrdu: boolean;
}

const TaxModule: React.FC<TaxModuleProps> = ({ isUrdu }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-12');

  const text = {
    en: {
      title: 'Tax Management & FBR Integration',
      salesTax: 'Sales Tax (GST)',
      incomeTax: 'Income Tax',
      fbrReturns: 'FBR Returns',
      taxSettings: 'Tax Settings',
      period: 'Period',
      totalSales: 'Total Sales',
      taxableAmount: 'Taxable Amount',
      taxDue: 'Tax Due',
      taxPaid: 'Tax Paid',
      balance: 'Balance',
      gstRate: 'GST Rate (%)',
      incomeTaxRate: 'Income Tax Rate (%)',
      ntnNumber: 'NTN Number',
      gstNumber: 'GST Number',
      generateReturn: 'Generate Return',
      submitToFBR: 'Submit to FBR',
      downloadReport: 'Download Report',
      payTax: 'Pay Tax',
      pending: 'Pending',
      submitted: 'Submitted',
      paid: 'Paid',
      overdue: 'Overdue'
    },
    ur: {
      title: 'ٹیکس منیجمنٹ اور ایف بی آر انٹیگریشن',
      salesTax: 'سیلز ٹیکس (جی ایس ٹی)',
      incomeTax: 'انکم ٹیکس',
      fbrReturns: 'ایف بی آر ریٹرنز',
      taxSettings: 'ٹیکس سیٹنگز',
      period: 'مدت',
      totalSales: 'کل سیلز',
      taxableAmount: 'ٹیکس کے قابل رقم',
      taxDue: 'واجب الادا ٹیکس',
      taxPaid: 'ادا شدہ ٹیکس',
      balance: 'بقیہ',
      gstRate: 'جی ایس ٹی ریٹ (%)',
      incomeTaxRate: 'انکم ٹیکس ریٹ (%)',
      ntnNumber: 'این ٹی این نمبر',
      gstNumber: 'جی ایس ٹی نمبر',
      generateReturn: 'ریٹرن تیار کریں',
      submitToFBR: 'ایف بی آر میں جمع کریں',
      downloadReport: 'رپورٹ ڈاؤن لوڈ',
      payTax: 'ٹیکس ادا کریں',
      pending: 'زیر التوا',
      submitted: 'جمع شدہ',
      paid: 'ادا شدہ',
      overdue: 'مقررہ وقت سے زیادہ'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Sample tax data
  const taxData = {
    currentPeriod: '2024-12',
    totalSales: 2500000.00,
    taxableAmount: 2500000.00,
    gstRate: 17,
    gstDue: 425000.00,
    gstPaid: 350000.00,
    incomeTaxRate: 1,
    incomeTaxDue: 25000.00,
    incomeTaxPaid: 25000.00,
    ntnNumber: 'NTN-1234567',
    gstNumber: 'GST-7654321'
  };

  const taxReturns = [
    {
      id: 1,
      period: '2024-12',
      type: 'GST',
      amount: 425000.00,
      dueDate: '2025-01-15',
      status: 'pending',
      submittedDate: null
    },
    {
      id: 2,
      period: '2024-11',
      type: 'GST',
      amount: 380000.00,
      dueDate: '2024-12-15',
      status: 'submitted',
      submittedDate: '2024-12-10'
    },
    {
      id: 3,
      period: '2024-11',
      type: 'Income Tax',
      amount: 22000.00,
      dueDate: '2024-12-15',
      status: 'paid',
      submittedDate: '2024-12-08'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{t.pending}</Badge>;
      case 'submitted':
        return <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />{t.submitted}</Badge>;
      case 'paid':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />{t.paid}</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />{t.overdue}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            {t.submitToFBR}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t.downloadReport}
          </Button>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.totalSales}</p>
                <p className="text-2xl font-bold text-blue-600">
                  PKR {taxData.totalSales.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">GST {t.taxDue}</p>
                <p className="text-2xl font-bold text-orange-600">
                  PKR {taxData.gstDue.toLocaleString()}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.incomeTax} {t.taxDue}</p>
                <p className="text-2xl font-bold text-purple-600">
                  PKR {taxData.incomeTaxDue.toLocaleString()}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.balance}</p>
                <p className="text-2xl font-bold text-red-600">
                  PKR {(taxData.gstDue - taxData.gstPaid).toLocaleString()}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gst">
        <TabsList>
          <TabsTrigger value="gst">{t.salesTax}</TabsTrigger>
          <TabsTrigger value="income">{t.incomeTax}</TabsTrigger>
          <TabsTrigger value="returns">{t.fbrReturns}</TabsTrigger>
          <TabsTrigger value="settings">{t.taxSettings}</TabsTrigger>
        </TabsList>

        <TabsContent value="gst" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GST {t.period}: {selectedPeriod}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">{t.totalSales}</p>
                  <p className="text-lg font-semibold">PKR {taxData.totalSales.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">GST @ {taxData.gstRate}%</p>
                  <p className="text-lg font-semibold">PKR {taxData.gstDue.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">{t.taxPaid}</p>
                  <p className="text-lg font-semibold">PKR {taxData.gstPaid.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">{t.balance}</p>
                  <p className="text-lg font-semibold">PKR {(taxData.gstDue - taxData.gstPaid).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button>
                  <Calculator className="h-4 w-4 mr-2" />
                  {t.generateReturn}
                </Button>
                <Button variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {t.payTax}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.incomeTax} {t.period}: {selectedPeriod}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">{t.taxableAmount}</p>
                  <p className="text-lg font-semibold">PKR {taxData.taxableAmount.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tax @ {taxData.incomeTaxRate}%</p>
                  <p className="text-lg font-semibold">PKR {taxData.incomeTaxDue.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">{t.taxPaid}</p>
                  <p className="text-lg font-semibold">PKR {taxData.incomeTaxPaid.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{t.balance}</p>
                  <p className="text-lg font-semibold">PKR {(taxData.incomeTaxDue - taxData.incomeTaxPaid).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.fbrReturns}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxReturns.map((returnItem) => (
                  <div key={returnItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{returnItem.type} - {returnItem.period}</h3>
                        <p className="text-sm text-gray-600">Due: {returnItem.dueDate}</p>
                        {returnItem.submittedDate && (
                          <p className="text-xs text-green-600">Submitted: {returnItem.submittedDate}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">PKR {returnItem.amount.toLocaleString()}</p>
                      {getStatusBadge(returnItem.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.taxSettings}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.ntnNumber}</label>
                  <Input value={taxData.ntnNumber} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.gstNumber}</label>
                  <Input value={taxData.gstNumber} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.gstRate}</label>
                  <Input value={taxData.gstRate} type="number" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.incomeTaxRate}</label>
                  <Input value={taxData.incomeTaxRate} type="number" />
                </div>
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxModule;
