import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function BillingSettings() {
  const { pharmacySettings, updateSettings } = useSettings();
  const [settings, setSettings] = useState<typeof pharmacySettings>(pharmacySettings);
  const { toast } = useToast();

  const handleSave = () => {
    try {
      updateSettings(settings);
      toast({
        title: 'Settings Saved',
        description: 'Your billing slip settings have been updated',
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Could not update billing settings',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Template Style</Label>
        <Select
          value={settings.template || 'default'}
          onValueChange={(value) => setSettings({...settings, template: value as any})}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="modern">Modern</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pharmacy-name">Pharmacy Name</Label>
        <Input 
          id="pharmacy-name" 
          value={settings.name || ''}
          onChange={(e) => setSettings({...settings, name: e.target.value})}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pharmacy-address">Address</Label>
        <Textarea 
          id="pharmacy-address" 
          value={settings.address || ''}
          onChange={(e) => setSettings({...settings, address: e.target.value})}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pharmacy-phone">Phone Number</Label>
        <Input 
          id="pharmacy-phone" 
          value={settings.phone || ''}
          onChange={(e) => setSettings({...settings, phone: e.target.value})}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="footer-text">Footer Text</Label>
        <Input 
          id="footer-text" 
          value={settings.footerText || ''}
          onChange={(e) => setSettings({...settings, footerText: e.target.value})}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo-url">Logo URL (optional)</Label>
        <Input 
          id="logo-url" 
          value={settings.logo || ''}
          onChange={(e) => setSettings({...settings, logo: e.target.value})}
        />
      </div>

      <Button onClick={handleSave}>Save Billing Settings</Button>
    </div>
  );
}
