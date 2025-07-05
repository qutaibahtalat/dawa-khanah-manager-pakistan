import React from 'react';
import EnhancedReports from '../components/EnhancedReports';
import { useSettings } from '@/contexts/SettingsContext';

const AnalyticsPage: React.FC = () => {
  const { isUrdu } = useSettings();
  return <EnhancedReports isUrdu={isUrdu} />;
};

export default AnalyticsPage;
