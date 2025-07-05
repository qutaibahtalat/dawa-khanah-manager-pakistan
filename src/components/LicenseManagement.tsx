
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, CheckCircle, CreditCard, Download, Users, Building } from 'lucide-react';
import { licenseManager, License, LicenseValidationResult } from '../utils/licenseManager';

interface LicenseManagementProps {
  isUrdu: boolean;
}

const LicenseManagement: React.FC<LicenseManagementProps> = ({ isUrdu }) => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [currentLicense, setCurrentLicense] = useState<License | null>(null);
  const [validationResult, setValidationResult] = useState<LicenseValidationResult | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRenewalDialog, setShowRenewalDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('monthly');
  const [branchName, setBranchName] = useState('');
  const [loading, setLoading] = useState(false);

  const text = {
    title: isUrdu ? 'لائسنس منیجمنٹ' : 'License Management',
    overview: isUrdu ? 'جائزہ' : 'Overview',
    currentLicense: isUrdu ? 'موجودہ لائسنس' : 'Current License',
    allLicenses: isUrdu ? 'تمام لائسنس' : 'All Licenses',
    createLicense: isUrdu ? 'نیا لائسنس بنائیں' : 'Create New License',
    renewLicense: isUrdu ? 'لائسنس تجدید' : 'Renew License',
    exportReport: isUrdu ? 'رپورٹ ایکسپورٹ' : 'Export Report',
    status: isUrdu ? 'حالت' : 'Status',
    active: isUrdu ? 'فعال' : 'Active',
    expired: isUrdu ? 'ختم' : 'Expired',
    suspended: isUrdu ? 'منعقد' : 'Suspended',
    gracePeriod: isUrdu ? 'رحمت کی مدت' : 'Grace Period',
    plan: isUrdu ? 'پلان' : 'Plan',
    monthly: isUrdu ? 'ماہانہ' : 'Monthly',
    yearly: isUrdu ? 'سالانہ' : 'Yearly',
    lifetime: isUrdu ? 'زندگی بھر' : 'Lifetime',
    expiryDate: isUrdu ? 'ختم ہونے کی تاریخ' : 'Expiry Date',
    branchName: isUrdu ? 'برانچ کا نام' : 'Branch Name',
    licenseKey: isUrdu ? 'لائسنس کی' : 'License Key',
    features: isUrdu ? 'خصوصیات' : 'Features',
    pricing: isUrdu ? 'قیمت' : 'Pricing',
    create: isUrdu ? 'بنائیں' : 'Create',
    renew: isUrdu ? 'تجدید' : 'Renew',
    cancel: isUrdu ? 'منسوخ' : 'Cancel',
    save: isUrdu ? 'محفوظ' : 'Save',
    daysRemaining: isUrdu ? 'باقی دن' : 'Days Remaining',
    maxUsers: isUrdu ? 'زیادہ سے زیادہ صارفین' : 'Max Users',
    maxBranches: isUrdu ? 'زیادہ سے زیادہ برانچز' : 'Max Branches'
  };

  const planDetails = {
    monthly: {
      name: text.monthly,
      price: '₨ 5,000',
      period: isUrdu ? '/ماہ' : '/month',
      description: isUrdu ? 'بنیادی خصوصیات کے ساتھ' : 'Basic features included',
      maxUsers: 5,
      maxBranches: 1,
      features: [
        isUrdu ? 'POS سسٹم' : 'POS System',
        isUrdu ? 'انوینٹری منیجمنٹ' : 'Inventory Management',
        isUrdu ? 'بنیادی رپورٹس' : 'Basic Reports',
        isUrdu ? 'کسٹمر منیجمنٹ' : 'Customer Management'
      ]
    },
    yearly: {
      name: text.yearly,
      price: '₨ 50,000',
      period: isUrdu ? '/سال' : '/year',
      description: isUrdu ? '2 ماہ مفت!' : '2 months free!',
      maxUsers: 10,
      maxBranches: 3,
      features: [
        isUrdu ? 'تمام ماہانہ خصوصیات' : 'All monthly features',
        isUrdu ? 'ایڈوانس رپورٹس' : 'Advanced Reports',
        isUrdu ? 'تجزیات' : 'Analytics',
        isUrdu ? 'وفاداری پروگرام' : 'Loyalty Program',
        isUrdu ? 'موبائل ایپ' : 'Mobile App'
      ]
    },
    lifetime: {
      name: text.lifetime,
      price: '₨ 2,00,000',
      period: isUrdu ? 'ایک بار' : 'one-time',
      description: isUrdu ? 'تمام خصوصیات مکمل' : 'All features included',
      maxUsers: 999,
      maxBranches: 999,
      features: [
        isUrdu ? 'تمام سالانہ خصوصیات' : 'All yearly features',
        isUrdu ? 'ملٹی برانچ' : 'Multi-branch',
        isUrdu ? 'کسٹم برانڈنگ' : 'Custom Branding',
        isUrdu ? 'انٹیگریشنز' : 'Integrations',
        isUrdu ? 'ترجیحی سپورٹ' : 'Priority Support',
        isUrdu ? 'کمپلائنس رپورٹس' : 'Compliance Reports'
      ]
    }
  };

  useEffect(() => {
    loadLicenseData();
  }, []);

  const loadLicenseData = () => {
    const allLicenses = licenseManager.getAllLicenses();
    const current = licenseManager.getLicenseInfo();
    const validation = licenseManager.validateLicense();
    
    setLicenses(allLicenses);
    setCurrentLicense(current);
    setValidationResult(validation);
  };

  const handleCreateLicense = async () => {
    if (!branchName.trim()) return;
    
    setLoading(true);
    try {
      const newLicense = licenseManager.createLicenseForBranch(
        Date.now().toString(),
        branchName,
        selectedPlan
      );
      
      setLicenses([...licenses, newLicense]);
      setShowCreateDialog(false);
      setBranchName('');
      loadLicenseData();
    } catch (error) {
      console.error('Failed to create license:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenewLicense = async () => {
    if (!currentLicense) return;
    
    setLoading(true);
    try {
      const success = licenseManager.renewLicense(currentLicense.id, selectedPlan);
      if (success) {
        setShowRenewalDialog(false);
        loadLicenseData();
      }
    } catch (error) {
      console.error('Failed to renew license:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    const report = licenseManager.exportLicenseReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `license_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: License['status']) => {
    const variants = {
      active: { variant: 'default', label: text.active },
      expired: { variant: 'destructive', label: text.expired },
      suspended: { variant: 'destructive', label: text.suspended },
      grace_period: { variant: 'secondary', label: text.gracePeriod }
    };
    
    const config = variants[status];
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const complianceStatus = licenseManager.getComplianceStatus();

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{text.title}</h1>
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Building className="h-4 w-4 mr-2" />
                {text.createLicense}
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="license-dialog-description">
              <div id="license-dialog-description" className="sr-only">
                Dialog for managing software licenses
              </div>
              <DialogHeader>
                <DialogTitle>{text.createLicense}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="branchName">{text.branchName}</Label>
                  <Input
                    id="branchName"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder={isUrdu ? 'برانچ کا نام داخل کریں' : 'Enter branch name'}
                  />
                </div>
                <div>
                  <Label>{text.plan}</Label>
                  <Select value={selectedPlan} onValueChange={(value: any) => setSelectedPlan(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">{planDetails.monthly.name} - {planDetails.monthly.price}</SelectItem>
                      <SelectItem value="yearly">{planDetails.yearly.name} - {planDetails.yearly.price}</SelectItem>
                      <SelectItem value="lifetime">{planDetails.lifetime.name} - {planDetails.lifetime.price}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    {text.cancel}
                  </Button>
                  <Button onClick={handleCreateLicense} disabled={loading}>
                    {loading ? isUrdu ? 'بن رہا ہے...' : 'Creating...' : text.create}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={handleExportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {text.exportReport}
          </Button>
        </div>
      </div>

      {/* Compliance Status Alert */}
      {!complianceStatus.isCompliant && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {complianceStatus.issues.join(', ')}
            {complianceStatus.recommendations.length > 0 && (
              <div className="mt-2">
                <strong>{isUrdu ? 'تجاویز:' : 'Recommendations:'}</strong> {complianceStatus.recommendations.join(', ')}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Current License Overview */}
      {currentLicense && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {text.currentLicense}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-500">{text.status}</div>
                <div>{getStatusBadge(currentLicense.status)}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-gray-500">{text.plan}</div>
                <div className="font-medium">
                  {planDetails[currentLicense.plan].name}
                  <div className="text-sm text-gray-500">
                    {planDetails[currentLicense.plan].price}{planDetails[currentLicense.plan].period}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-gray-500">{text.expiryDate}</div>
                <div className="font-medium">
                  {new Date(currentLicense.expiryDate).toLocaleDateString()}
                  {validationResult?.daysRemaining && (
                    <div className="text-sm text-gray-500">
                      {validationResult.daysRemaining} {text.daysRemaining}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-gray-500">{text.maxUsers}</div>
                <div className="font-medium flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {currentLicense.maxUsers}
                </div>
              </div>
            </div>
            
            {(validationResult?.requiresRenewal || currentLicense.status === 'grace_period') && (
              <div className="mt-4">
                <Dialog open={showRenewalDialog} onOpenChange={setShowRenewalDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full md:w-auto">
                      <CreditCard className="h-4 w-4 mr-2" />
                      {text.renewLicense}
                    </Button>
                  </DialogTrigger>
                  <DialogContent aria-describedby="license-dialog-description">
                    <div id="license-dialog-description" className="sr-only">
                      Dialog for managing software licenses
                    </div>
                    <DialogHeader>
                      <DialogTitle>{text.renewLicense}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>{text.plan}</Label>
                        <Select value={selectedPlan} onValueChange={(value: any) => setSelectedPlan(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">
                              <div>
                                <div>{planDetails.monthly.name} - {planDetails.monthly.price}{planDetails.monthly.period}</div>
                                <div className="text-sm text-gray-500">{planDetails.monthly.description}</div>
                              </div>
                            </SelectItem>
                            <SelectItem value="yearly">
                              <div>
                                <div>{planDetails.yearly.name} - {planDetails.yearly.price}{planDetails.yearly.period}</div>
                                <div className="text-sm text-gray-500">{planDetails.yearly.description}</div>
                              </div>
                            </SelectItem>
                            <SelectItem value="lifetime">
                              <div>
                                <div>{planDetails.lifetime.name} - {planDetails.lifetime.price} {planDetails.lifetime.period}</div>
                                <div className="text-sm text-gray-500">{planDetails.lifetime.description}</div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{text.features}</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {planDetails[selectedPlan].features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowRenewalDialog(false)}>
                          {text.cancel}
                        </Button>
                        <Button onClick={handleRenewLicense} disabled={loading}>
                          {loading ? isUrdu ? 'تجدید ہو رہی ہے...' : 'Renewing...' : text.renew}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pricing Plans */}
      <Card>
        <CardHeader>
          <CardTitle>{text.pricing}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(planDetails).map(([planKey, plan]) => (
              <div key={planKey} className="border rounded-lg p-6 space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="text-3xl font-bold text-primary mt-2">
                    {plan.price}
                    <span className="text-base font-normal text-gray-500">{plan.period}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{plan.description}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    {plan.maxUsers} {text.maxUsers}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4" />
                    {plan.maxBranches} {text.maxBranches}
                  </div>
                </div>
                
                <div className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Licenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>{text.allLicenses}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{text.branchName}</TableHead>
                <TableHead>{text.plan}</TableHead>
                <TableHead>{text.status}</TableHead>
                <TableHead>{text.expiryDate}</TableHead>
                <TableHead>{text.licenseKey}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map((license) => (
                <TableRow key={license.id}>
                  <TableCell className="font-medium">{license.branchName}</TableCell>
                  <TableCell>
                    <div>
                      <div>{planDetails[license.plan].name}</div>
                      <div className="text-sm text-gray-500">
                        {planDetails[license.plan].price}{planDetails[license.plan].period}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(license.status)}</TableCell>
                  <TableCell>{new Date(license.expiryDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {license.licenseKey}
                    </code>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LicenseManagement;
