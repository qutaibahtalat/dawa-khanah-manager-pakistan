
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import MedicineManagement from '../components/MedicineManagement';
import POSSystem from '../components/POSSystem';
import InventoryControl from '../components/InventoryControl';
import Reports from '../components/Reports';
import Settings from '../components/Settings';
import Login from '../components/Login';
import Footer from '../components/Footer';
import AuditLogs from '../components/AuditLogs';
import ExpenseTracker from '../components/ExpenseTracker';
import CustomerManagement from '../components/CustomerManagement';
import SupplierManagement from '../components/SupplierManagement';
import BranchManagement from '../components/BranchManagement';
import StaffAttendance from '../components/StaffAttendance';
import TaxModule from '../components/TaxModule';

const Index = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isUrdu, setIsUrdu] = useState(false);

  if (!currentUser) {
    return (
      <>
        <Login onLogin={setCurrentUser} isUrdu={isUrdu} setIsUrdu={setIsUrdu} />
        <Footer />
      </>
    );
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard isUrdu={isUrdu} />;
      case 'medicines':
        return <MedicineManagement isUrdu={isUrdu} />;
      case 'pos':
        return <POSSystem isUrdu={isUrdu} />;
      case 'inventory':
        return <InventoryControl isUrdu={isUrdu} />;
      case 'customers':
        return <CustomerManagement isUrdu={isUrdu} />;
      case 'suppliers':
        return <SupplierManagement isUrdu={isUrdu} />;
      case 'branches':
        return <BranchManagement isUrdu={isUrdu} />;
      case 'staff-attendance':
        return <StaffAttendance isUrdu={isUrdu} />;
      case 'tax-module':
        return <TaxModule isUrdu={isUrdu} />;
      case 'reports':
        return <Reports isUrdu={isUrdu} />;
      case 'audit-logs':
        return <AuditLogs isUrdu={isUrdu} />;
      case 'expenses':
        return <ExpenseTracker isUrdu={isUrdu} />;
      case 'settings':
        return <Settings isUrdu={isUrdu} setIsUrdu={setIsUrdu} />;
      default:
        return <Dashboard isUrdu={isUrdu} />;
    }
  };

  return (
    <div className={`min-h-screen flex bg-gray-50 ${isUrdu ? 'rtl' : 'ltr'}`}>
      <Sidebar 
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        isUrdu={isUrdu}
      />
      <div className="flex-1 overflow-hidden">
        {renderActiveModule()}
      </div>
      <Footer />
    </div>
  );
};

export default Index;
