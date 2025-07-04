import { useState, useEffect } from 'react';

type Template = 'default' | 'minimal' | 'modern';

type PharmacySettings = {
  name?: string;
  address?: string;
  phone?: string;
  logo?: string;
  footerText?: string;
  template?: Template;
};

export function useSettings() {
  const [pharmacySettings, setPharmacySettings] = useState<PharmacySettings>({});

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('pharmacySettings');
    if (savedSettings) {
      setPharmacySettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSettings = (newSettings: Partial<PharmacySettings>) => {
    const updatedSettings = { ...pharmacySettings, ...newSettings };
    setPharmacySettings(updatedSettings);
    localStorage.setItem('pharmacySettings', JSON.stringify(updatedSettings));
  };

  return { 
    pharmacySettings, 
    updateSettings 
  };
}
