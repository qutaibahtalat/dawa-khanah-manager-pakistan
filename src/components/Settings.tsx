
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Building, 
  User, 
  Bell, 
  Shield, 
  Printer,
  Database,
  Globe,
  Settings as SettingsIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';

interface SettingsProps {
  isUrdu: boolean;
  setIsUrdu: (value: boolean) => void;
}

// Default settings
const defaultSettings = {
  companyName: 'PharmaCare',
  companyAddress: 'Main Boulevard, Gulshan-e-Iqbal, Karachi',
  companyPhone: '+92-21-1234567',
  companyEmail: 'info@pharmacare.com',
  taxRate: '17',
  currency: 'PKR',
  dateFormat: 'dd/mm/yyyy',
  notifications: true,
  autoBackup: true,
  printReceipts: true,
  barcodeScanning: true,
  language: 'en'
};

const Settings: React.FC<SettingsProps> = ({ isUrdu, setIsUrdu }) => {
  const { toast } = useToast();
  const { settings: contextSettings, updateSettings } = useSettings();
  const [settings, setSettings] = useState(contextSettings);
  
  // Update local state when context settings change
  useEffect(() => {
    setSettings(contextSettings);
  }, [contextSettings]);
  
  // Update parent language when settings change
  useEffect(() => {
    setIsUrdu(settings.language === 'ur');
  }, [settings.language, setIsUrdu]);

  const text = {
    en: {
      title: 'Settings',
      company: 'Company Settings',
      system: 'System Settings',
      notifications: 'Notifications',
      backup: 'Backup & Security',
      companyName: 'Company Name',
      companyAddress: 'Company Address',
      companyPhone: 'Phone Number',
      companyEmail: 'Email Address',
      taxRate: 'Tax Rate (%)',
      currency: 'Currency',
      dateFormat: 'Date Format',
      language: 'Language',
      enableNotifications: 'Enable Notifications',
      autoBackup: 'Auto Backup',
      printReceipts: 'Auto Print Receipts',
      barcodeScanning: 'Enable Barcode Scanning',
      save: 'Save Settings',
      english: 'English',
      urdu: 'اردو',
      saved: 'Settings saved successfully!'
    },
    ur: {
      title: 'سیٹنگز',
      company: 'کمپنی کی سیٹنگز',
      system: 'سسٹم کی سیٹنگز',
      notifications: 'اطلاعات',
      backup: 'بیک اپ اور سیکیورٹی',
      companyName: 'کمپنی کا نام',
      companyAddress: 'کمپنی کا پتہ',
      companyPhone: 'فون نمبر',
      companyEmail: 'ای میل ایڈریس',
      taxRate: 'ٹیکس کی شرح (%)',
      currency: 'کرنسی',
      dateFormat: 'تاریخ کا فارمیٹ',
      language: 'زبان',
      enableNotifications: 'اطلاعات فعال کریں',
      autoBackup: 'خودکار بیک اپ',
      printReceipts: 'خودکار رسید پرنٹ',
      barcodeScanning: 'بار کوڈ اسکیننگ فعال کریں',
      save: 'سیٹنگز محفوظ کریں',
      english: 'English',
      urdu: 'اردو',
      saved: 'سیٹنگز کامیابی سے محفوظ ہوئیں!'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  const handleSave = () => {
    try {
      // Update settings through context
      updateSettings(settings);
      
      // Show success message
      toast({
        title: t.saved,
        description: "All settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLanguageChange = (language: string) => {
    const updatedSettings = { ...settings, language };
    setSettings(updatedSettings);
    // Don't update parent component yet - wait for save
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <SettingsIcon className="h-8 w-8 text-gray-600" />
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">{t.company}</TabsTrigger>
          <TabsTrigger value="system">{t.system}</TabsTrigger>
          <TabsTrigger value="notifications">{t.notifications}</TabsTrigger>
          <TabsTrigger value="backup">{t.backup}</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>{t.company}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t.companyName}</Label>
                  <Input
                    value={settings.companyName}
                    onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                  />
                </div>
                <div>
                  <Label>{t.companyPhone}</Label>
                  <Input
                    value={settings.companyPhone}
                    onChange={(e) => setSettings({...settings, companyPhone: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label>{t.companyEmail}</Label>
                <Input
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => setSettings({...settings, companyEmail: e.target.value})}
                />
              </div>
              
              <div>
                <Label>{t.companyAddress}</Label>
                <Textarea
                  value={settings.companyAddress}
                  onChange={(e) => setSettings({...settings, companyAddress: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5" />
                <span>{t.system}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>{t.taxRate}</Label>
                  <Input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({...settings, taxRate: e.target.value})}
                  />
                </div>
                <div>
                  <Label>{t.currency}</Label>
                  <Select value={settings.currency} onValueChange={(value) => setSettings({...settings, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.dateFormat}</Label>
                  <Select value={settings.dateFormat} onValueChange={(value) => setSettings({...settings, dateFormat: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>{t.language}</Label>
                <Select value={settings.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t.english}</SelectItem>
                    <SelectItem value="ur">{t.urdu}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>{t.notifications}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t.enableNotifications}</Label>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>{t.printReceipts}</Label>
                <Switch
                  checked={settings.printReceipts}
                  onCheckedChange={(checked) => setSettings({...settings, printReceipts: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>{t.barcodeScanning}</Label>
                <Switch
                  checked={settings.barcodeScanning}
                  onCheckedChange={(checked) => setSettings({...settings, barcodeScanning: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>{t.backup}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t.autoBackup}</Label>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
                />
              </div>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Create Manual Backup
                </Button>
                <Button variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Restore from Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-8">
          <Save className="h-4 w-4 mr-2" />
          {t.save}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
