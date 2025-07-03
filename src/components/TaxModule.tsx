import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
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
  Calendar,
  Loader2
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface TaxModuleProps {
  isUrdu: boolean;
}

interface TaxReturn {
  id: string;
  period: string;
  type: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'submitted' | 'paid' | 'overdue';
  submittedDate: string | null;
}

const TaxModule: React.FC<TaxModuleProps> = ({ isUrdu }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-12');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([
    {
      id: '1',
      period: '2024-12',
      type: 'GST',
      amount: 425000.00,
      dueDate: '2025-01-15',
      status: 'pending',
      submittedDate: null
    },
    {
      id: '2',
      period: '2024-11',
      type: 'GST',
      amount: 385000.00,
      dueDate: '2024-12-15',
      status: 'paid',
      submittedDate: '2024-12-10'
    }
  ]);

  const [taxSettings, setTaxSettings] = useState({
    gstRate: 17,
    incomeTaxRate: 5,
    salesTaxRate: 17,
    fbrCredentials: {
      username: '',
      password: '',
      businessId: ''
    },
    autoSubmitReturns: false,
    taxYearStart: '2024-07-01',
    taxYearEnd: '2025-06-30'
  });

  const [showTaxSettings, setShowTaxSettings] = useState(false);
  const [showFBRLogin, setShowFBRLogin] = useState(false);

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

  const handleTaxRateChange = (taxType: string, value: number) => {
    setTaxSettings(prev => ({
      ...prev,
      [`${taxType}Rate`]: value
    }));
    
    // Save to localStorage
    localStorage.setItem('tax_settings', JSON.stringify({
      ...taxSettings,
      [`${taxType}Rate`]: value
    }));
    
    toast({
      title: 'Tax Rate Updated',
      description: `${taxType.toUpperCase()} rate updated to ${value}%`,
      variant: 'default'
    });
  };

  const handleFBRCredentialsUpdate = (credentials: any) => {
    setTaxSettings(prev => ({
      ...prev,
      fbrCredentials: {
        ...prev.fbrCredentials,
        ...credentials
      }
    }));
    
    localStorage.setItem('tax_settings', JSON.stringify({
      ...taxSettings,
      fbrCredentials: {
        ...taxSettings.fbrCredentials,
        ...credentials
      }
    }));
    
    toast({
      title: 'FBR Credentials Updated',
      description: 'FBR login details have been saved',
      variant: 'default'
    });
  };

  const autoGenerateReturns = () => {
    const returns: TaxReturn[] = [];
    const currentDate = new Date();
    
    // Generate monthly GST returns for the current tax year
    const startDate = new Date(taxSettings.taxYearStart);
    const endDate = new Date(taxSettings.taxYearEnd);
    
    while (startDate <= endDate) {
      const period = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}`;
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + 1);
      dueDate.setDate(15);
      
      returns.push({
        id: Math.random().toString(36).substr(2, 9),
        period,
        type: 'GST',
        amount: 0,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending',
        submittedDate: null
      });
      
      startDate.setMonth(startDate.getMonth() + 1);
    }
    
    // Add annual income tax return
    returns.push({
      id: Math.random().toString(36).substr(2, 9),
      period: `${new Date(taxSettings.taxYearStart).getFullYear()}-${new Date(taxSettings.taxYearEnd).getFullYear()}`,
      type: 'Income Tax',
      amount: 0,
      dueDate: new Date(taxSettings.taxYearEnd).toISOString().split('T')[0],
      status: 'pending',
      submittedDate: null
    });
    
    setTaxReturns(returns);
    localStorage.setItem('tax_returns', JSON.stringify(returns));
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('tax_settings');
    const savedReturns = localStorage.getItem('tax_returns');
    
    if (savedSettings) {
      setTaxSettings(JSON.parse(savedSettings));
    }
    
    if (savedReturns) {
      setTaxReturns(JSON.parse(savedReturns));
    } else {
      autoGenerateReturns();
    }
  }, []);

  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);
      
      // Get the current date for the filename
      const today = new Date().toISOString().split('T')[0];
      
      // Prepare report data
      const reportData = {
        period: selectedPeriod,
        gst: {
          rate: taxData.gstRate,
          due: taxData.gstDue,
          paid: taxData.gstPaid,
          balance: taxData.gstDue - taxData.gstPaid
        },
        incomeTax: {
          rate: taxData.incomeTaxRate,
          due: taxData.incomeTaxDue,
          paid: taxData.incomeTaxPaid,
          balance: taxData.incomeTaxDue - taxData.incomeTaxPaid
        },
        totalSales: taxData.totalSales,
        taxableAmount: taxData.taxableAmount,
        ntnNumber: taxData.ntnNumber,
        gstNumber: taxData.gstNumber
      };

      // Create CSV content
      const csvContent = [
        '\uFEFF', // Add BOM for Excel
        'Tax Report',
        `Period:,${selectedPeriod}`,
        `NTN:,${taxData.ntnNumber}`,
        `GST Number:,${taxData.gstNumber}`,
        '',
        'GST Details',
        `Rate,${taxData.gstRate}%`,
        `Tax Due,${taxData.gstDue.toFixed(2)}`,
        `Tax Paid,${taxData.gstPaid.toFixed(2)}`,
        `Balance,${(taxData.gstDue - taxData.gstPaid).toFixed(2)}`,
        '',
        'Income Tax Details',
        `Rate,${taxData.incomeTaxRate}%`,
        `Tax Due,${taxData.incomeTaxDue.toFixed(2)}`,
        `Tax Paid,${taxData.incomeTaxPaid.toFixed(2)}`,
        `Balance,${(taxData.incomeTaxDue - taxData.incomeTaxPaid).toFixed(2)}`,
        '',
        'Summary',
        `Total Sales,${taxData.totalSales.toFixed(2)}`,
        `Taxable Amount,${taxData.taxableAmount.toFixed(2)}`,
        `Total Tax Due,${(taxData.gstDue + taxData.incomeTaxDue).toFixed(2)}`,
        `Total Tax Paid,${(taxData.gstPaid + taxData.incomeTaxPaid).toFixed(2)}`,
        `Total Balance,${(taxData.gstDue + taxData.incomeTaxDue - taxData.gstPaid - taxData.incomeTaxPaid).toFixed(2)}`
      ].join('\r\n');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `tax_report_${selectedPeriod}_${today}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);

      // Show success message
      toast({
        title: isUrdu ? 'رپورٹ ڈاؤن لوڈ ہو گئی' : 'Report Downloaded',
        description: isUrdu 
          ? 'ٹیکس کی رپورٹ کامیابی سے ڈاؤن لوڈ ہو گئی' 
          : 'Tax report has been downloaded successfully',
        duration: 3000
      });
    } catch (error) {
      console.error('Failed to download report:', error);
      toast({
        title: isUrdu ? 'خرابی' : 'Error',
        description: isUrdu 
          ? 'رپورٹ ڈاؤن لوڈ کرتے وقت خرابی آئی ہے' 
          : 'Failed to download report',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSubmitToFBR = async () => {
    try {
      setIsSubmitting(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would be an API call to FBR
      const submissionData = {
        period: selectedPeriod,
        gstAmount: taxData.gstDue,
        incomeTaxAmount: taxData.incomeTaxDue,
        ntnNumber: taxData.ntnNumber,
        gstNumber: taxData.gstNumber,
        submissionDate: new Date().toISOString()
      };
      
      console.log('Submitting to FBR:', submissionData);
      
      // Show success message
      toast({
        title: isUrdu ? 'کامیابی' : 'Success',
        description: isUrdu 
          ? 'ٹیکس کی معلومات کامیابی سے ایف بی آر کو جمع کرائی گئیں' 
          : 'Tax information has been successfully submitted to FBR',
        duration: 3000
      });
      
      // Update the tax returns list with the new submission
      // In a real app, this would come from the API response
      const newReturn: TaxReturn = {
        id: Math.random().toString(36).substr(2, 9),
        period: selectedPeriod,
        type: 'GST & Income Tax',
        amount: taxData.gstDue + taxData.incomeTaxDue,
        dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        status: 'submitted',
        submittedDate: new Date().toISOString().split('T')[0]
      };
      setTaxReturns(prevReturns => [newReturn, ...prevReturns]);
      
    } catch (error) {
      console.error('Failed to submit to FBR:', error);
      toast({
        title: isUrdu ? 'جمع کرانے میں ناکامی' : 'Submission Failed',
        description: isUrdu 
          ? 'ایف بی آر کو ڈیٹا جمع کراتے وقت خرابی آئی ہے' 
          : 'Failed to submit data to FBR. Please try again later.',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTaxSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">GST Rate (%)</label>
          <Input 
            type="number" 
            value={taxSettings.gstRate} 
            onChange={(e) => handleTaxRateChange('gst', Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Income Tax Rate (%)</label>
          <Input 
            type="number" 
            value={taxSettings.incomeTaxRate} 
            onChange={(e) => handleTaxRateChange('incomeTax', Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sales Tax Rate (%)</label>
          <Input 
            type="number" 
            value={taxSettings.salesTaxRate} 
            onChange={(e) => handleTaxRateChange('salesTax', Number(e.target.value))}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tax Year Start</label>
          <Input 
            type="date" 
            value={taxSettings.taxYearStart} 
            onChange={(e) => setTaxSettings(prev => ({
              ...prev,
              taxYearStart: e.target.value
            }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tax Year End</label>
          <Input 
            type="date" 
            value={taxSettings.taxYearEnd} 
            onChange={(e) => setTaxSettings(prev => ({
              ...prev,
              taxYearEnd: e.target.value
            }))}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="autoSubmit" 
          checked={taxSettings.autoSubmitReturns}
          onCheckedChange={(checked) => setTaxSettings(prev => ({
            ...prev,
            autoSubmitReturns: !!checked
          }))}
        />
        <label htmlFor="autoSubmit" className="text-sm font-medium">
          Automatically submit returns to FBR
        </label>
      </div>
      
      <Button 
        variant="outline" 
        onClick={() => setShowFBRLogin(true)}
      >
        Update FBR Credentials
      </Button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleSubmitToFBR}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isUrdu ? 'جمع کرایا جا رہا ہے...' : 'Submitting...'}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {t.submitToFBR}
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={handleDownloadReport}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isUrdu ? 'ڈاؤن لوڈ ہو رہا ہے...' : 'Downloading...'}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {t.downloadReport}
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowTaxSettings(true)}
          >
            {t.taxSettings}
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
          {renderTaxSettings()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxModule;
