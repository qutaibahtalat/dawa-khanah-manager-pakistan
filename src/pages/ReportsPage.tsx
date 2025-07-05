import React from 'react';
import Reports from '../components/Reports';
import ErrorBoundary from '../components/ErrorBoundary';
import { useSettings } from '@/contexts/SettingsContext';

const ReportsPage: React.FC = () => {
  const { isUrdu } = useSettings();
  return (
    <ErrorBoundary>
      <Reports isUrdu={isUrdu} />
    </ErrorBoundary>
  );
};

export default ReportsPage;
