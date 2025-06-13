
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Clock, AlertTriangle, CheckCircle, Key, Building, CreditCard } from 'lucide-react';
import { licenseManager, License, LicenseValidationResult } from '../utils/licenseManager';

interface LicenseManagementProps {
  isUrdu: boolean;
}

const LicenseManagement: React.FC<LicenseManagementProps> = ({ isUrdu }) => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [validation, setValidation] = useState<LicenseValidationResult | null>(null);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchPlan, setNewBranchPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('monthly');

  useEffect(() => {
    loadLicenses();
    validateCurrentLicense();
  }, []);

  const loadLicenses = () => {
    setLicenses(licenseManager.getAllLicenses());
  };

  const validateCurrentLicense = () => {
    const result = licenseManager.validateLicense();
    setValidation(result);
  };

  const handleCreateLicense = () => {
    if (!newBranchName) return;
    
    const branchId = newBranchName.toLowerCase().replace(/\s+/g, '_');
    licenseManager.createLicenseForBranch(branchId, newBranchName, newBranchPlan);
    loadLicenses();
    setNewBranchName('');
  };

  const handleRenewLicense = (licenseId: string, plan: License['plan']) => {
    licenseManager.renewLicense(licenseId, plan);
    loadLicenses();
    validateCurrentLicense();
  };

  const handleRevokeLicense = (licenseId: string) => {
    licenseManager.revokeLicense(licenseId);
    loadLicenses();
  };

  const getStatusColor = (status: License['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'expired': return 'bg-red-500';
      case 'suspended': return 'bg-gray-500';
      case 'grace_period': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlanPrice = (plan: License['plan']) => {
    switch (plan) {
      case 'monthly': return '₨5,000/month';
      case 'yearly': return '₨40,000/year';
      case 'lifetime': return '₨100,000 one-time';
      default: return '';
    }
  };

  const text = {
    title: isUrdu ? 'لائسنس منیجمنٹ' : 'License Management',
    currentLicense: isUrdu ? 'موجودہ لائسنس' : 'Current License',
    allLicenses: isUrdu ? 'تمام لائسنس' : 'All Licenses',
    createNew: isUrdu ? 'نیا لائسنس' : 'Create New',
    status: isUrdu ? 'حالت' : 'Status',
    plan: isUrdu ? 'پلان' : 'Plan',
    expiry: isUrdu ? 'ختم ہونے کی تاریخ' : 'Expiry Date',
    features: isUrdu ? 'خصوصیات' : 'Features',
    branchName: isUrdu ? 'برانچ کا نام' : 'Branch Name',
    selectPlan: isUrdu ? 'پلان منتخب کریں' : 'Select Plan',
    create: isUrdu ? 'بنائیں' : 'Create',
    renew: isUrdu ? 'تجدید' : 'Renew',
    revoke: isUrdu ? 'منسوخ' : 'Revoke',
    active: isUrdu ? 'فعال' : 'Active',
    expired: isUrdu ? 'ختم' : 'Expired',
    gracePeriod: isUrdu ? 'مہلت کی مدت' : 'Grace Period',
    suspended: isUrdu ? 'معطل' : 'Suspended',
    monthly: isUrdu ? 'ماہانہ' : 'Monthly',
    yearly: isUrdu ? 'سالانہ' : 'Yearly',
    lifetime: isUrdu ? 'تاحیات' : 'Lifetime',
    validUntil: isUrdu ? 'درست تا' : 'Valid Until',
    daysRemaining: isUrdu ? 'باقی دن' : 'Days Remaining',
    licenseKey: isUrdu ? 'لائسنس کلید' : 'License Key',
    hardwareId: isUrdu ? 'ہارڈویئر ID' : 'Hardware ID'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{text.title}</h1>
        <Shield className="h-8 w-8 text-blue-600" />
      </div>

      {/* Current License Status */}
      {validation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {text.currentLicense}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validation.valid ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 font-medium">
                    {validation.gracePeriodActive ? text.gracePeriod : text.active}
                  </span>
                  {validation.license && (
                    <Badge className={getStatusColor(validation.license.status)}>
                      {validation.license.status}
                    </Badge>
                  )}
                </div>
                
                {validation.daysRemaining !== undefined && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{text.daysRemaining}: {validation.daysRemaining}</span>
                  </div>
                )}

                {validation.requiresRenewal && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {isUrdu 
                        ? 'آپ کا لائسنس جلد ختم ہونے والا ہے۔ براہ کرم تجدید کریں۔'
                        : 'Your license is expiring soon. Please renew to continue using all features.'
                      }
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span>{validation.error}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="licenses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="licenses">{text.allLicenses}</TabsTrigger>
          <TabsTrigger value="create">{text.createNew}</TabsTrigger>
        </TabsList>

        <TabsContent value="licenses" className="space-y-4">
          {licenses.map((license) => (
            <Card key={license.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {license.branchName}
                  </CardTitle>
                  <Badge className={getStatusColor(license.status)}>
                    {license.status}
                  </Badge>
                </div>
                <CardDescription>
                  {text.licenseKey}: {license.licenseKey}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">{text.plan}</Label>
                    <p className="text-sm">{license.plan} - {getPlanPrice(license.plan)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{text.validUntil}</Label>
                    <p className="text-sm">{new Date(license.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{text.features}</Label>
                    <p className="text-sm">{license.features.length} features</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{text.hardwareId}</Label>
                    <p className="text-sm font-mono text-xs">{license.hardwareFingerprint.substring(0, 8)}...</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Select onValueChange={(value: License['plan']) => handleRenewLicense(license.id, value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={text.renew} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">{text.monthly} - ₨5,000</SelectItem>
                      <SelectItem value="yearly">{text.yearly} - ₨40,000</SelectItem>
                      <SelectItem value="lifetime">{text.lifetime} - ₨100,000</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevokeLicense(license.id)}
                  >
                    {text.revoke}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {text.createNew}
              </CardTitle>
              <CardDescription>
                {isUrdu 
                  ? 'نئی برانچ کے لیے لائسنس بنائیں'
                  : 'Create a new license for a branch'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="branchName">{text.branchName}</Label>
                <Input
                  id="branchName"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder={isUrdu ? 'برانچ کا نام درج کریں' : 'Enter branch name'}
                />
              </div>

              <div className="space-y-2">
                <Label>{text.selectPlan}</Label>
                <Select value={newBranchPlan} onValueChange={(value: any) => setNewBranchPlan(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">{text.monthly} - ₨5,000/month</SelectItem>
                    <SelectItem value="yearly">{text.yearly} - ₨40,000/year</SelectItem>
                    <SelectItem value="lifetime">{text.lifetime} - ₨100,000 one-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleCreateLicense} disabled={!newBranchName}>
                {text.create}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LicenseManagement;
