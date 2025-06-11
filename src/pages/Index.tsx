
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import MedicineManagement from '../components/MedicineManagement';
import POSSystem from '../components/POSSystem';
import InventoryControl from '../components/InventoryControl';
import Reports from '../components/Reports';
import Settings from '../components/Settings';
import Login from '../components/Login';

const Index = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isUrdu, setIsUrdu] = useState(false);

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} isUrdu={isUrdu} setIsUrdu={setIsUrdu} />;
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
      case 'reports':
        return <Reports isUrdu={isUrdu} />;
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
    </div>
  );
};

export default Index;
