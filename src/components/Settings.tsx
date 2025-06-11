
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings as SettingsIcon, 
  Building, 
  Palette, 
  Database, 
  Shield,
  Printer,
  Globe,
  DollarSign
} from 'lucide-react';

interface SettingsProps {
  isUrdu: boolean;
  setIsUrdu: (value: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ isUrdu, setIsUrdu }) => {
  const [pharmacySettings, setPharmacySettings] = useState({
    name: 'City Pharmacy',
    address: '123 Main Street, Karachi',
    phone: '+92-21-1234567',
    email: 'info@citypharmacy.com',
    license: 'PH-2024-001'
  });

  const text = {
    en: {
      title: 'Settings',
      pharmacyInfo: 'Pharmacy Information',
      appearance: 'Appearance',
      backup: 'Backup & Restore',
      security: 'Security',
      printing: 'Printing',
      pharmacy: 'Pharmacy',
      pharmacyName: 'Pharmacy Name',
      address: 'Address',
      phone: 'Phone Number',
      email: 'Email',
      license: 'License Number',
      language: 'Language',
      currency: 'Currency',
      taxRate: 'Tax Rate (%)',
      darkMode: 'Dark Mode',
      autoBackup: 'Auto Backup',
      backupLocation: 'Backup Location',
      save: 'Save Settings',
      selectLanguage: 'Select Language',
      selectCurrency: 'Select Currency'
    },
    ur: {
      title: 'سیٹنگز',
      pharmacyInfo: 'فارمیسی کی معلومات',
      appearance: 'ظاہری شکل',
      backup: 'بیک اپ اور بحالی',
      security: 'سیکیورٹی',
      printing: 'پرنٹنگ',
      pharmacy: 'فارمیسی',
      pharmacyName: 'فارمیسی کا نام',
      address: 'پتہ',
      phone: 'فون نمبر',
      email: 'ای میل',
      license: 'لائسنس نمبر',
      language: 'زبان',
      currency: 'کرنسی',
      taxRate: 'ٹیکس کی شرح (%)',
      darkMode: 'ڈارک موڈ',
      autoBackup: 'خودکار بیک اپ',
      backupLocation: 'بیک اپ کا مقام',
      save: 'سیٹنگز محفوظ کریں',
      selectLanguage: 'زبان منتخب کریں',
      selectCurrency: 'کرنسی منتخب کریں'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <Button>
          <SettingsIcon className="h-4 w-4 mr-2" />
          {t.save}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="pharmacy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pharmacy" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">{t.pharmacy}</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">{t.appearance}</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">{t.backup}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">{t.security}</span>
          </TabsTrigger>
          <TabsTrigger value="printing" className="flex items-center space-x-2">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">{t.printing}</span>
          </TabsTrigger>
        </TabsList>

        {/* Pharmacy Information */}
        <TabsContent value="pharmacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>{t.pharmacyInfo}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pharmacyName">{t.pharmacyName}</Label>
                  <Input
                    id="pharmacyName"
                    value={pharmacySettings.name}
                    onChange={(e) => setPharmacySettings({...pharmacySettings, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">{t.license}</Label>
                  <Input
                    id="license"
                    value={pharmacySettings.license}
                    onChange={(e) => setPharmacySettings({...pharmacySettings, license: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">{t.address}</Label>
                  <Input
                    id="address"
                    value={pharmacySettings.address}
                    onChange={(e) => setPharmacySettings({...pharmacySettings, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.phone}</Label>
                  <Input
                    id="phone"
                    value={pharmacySettings.phone}
                    onChange={(e) => setPharmacySettings({...pharmacySettings, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={pharmacySettings.email}
                    onChange={(e) => setPharmacySettings({...pharmacySettings, email: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>{t.appearance}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">{t.language}</Label>
                  <Select value={isUrdu ? 'ur' : 'en'} onValueChange={(value) => setIsUrdu(value === 'ur')}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectLanguage} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ur">اردو (Urdu)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">{t.currency}</Label>
                  <Select defaultValue="PKR">
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectCurrency} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate">{t.taxRate}</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    defaultValue="17"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="darkMode">{t.darkMode}</Label>
                    <p className="text-sm text-gray-600">Toggle dark theme</p>
                  </div>
                  <Switch id="darkMode" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>{t.backup}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoBackup">{t.autoBackup}</Label>
                  <p className="text-sm text-gray-600">Automatically backup data daily</p>
                </div>
                <Switch id="autoBackup" defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupLocation">{t.backupLocation}</Label>
                <div className="flex space-x-2">
                  <Input
                    id="backupLocation"
                    defaultValue="C:\PharmacyBackups"
                    className="flex-1"
                  />
                  <Button variant="outline">Browse</Button>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button>Create Backup Now</Button>
                <Button variant="outline">Restore from Backup</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>{t.security}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 py-8">Security settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Printing Settings */}
        <TabsContent value="printing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Printer className="h-5 w-5" />
                <span>{t.printing}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 py-8">Printing settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
