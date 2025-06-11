
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Pill, 
  ShoppingCart, 
  Package, 
  FileText, 
  Settings, 
  LogOut,
  User
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  currentUser: any;
  onLogout: () => void;
  isUrdu: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeModule, 
  setActiveModule, 
  currentUser, 
  onLogout, 
  isUrdu 
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      label: { en: 'Dashboard', ur: 'ڈیش بورڈ' }
    },
    {
      id: 'medicines',
      icon: Pill,
      label: { en: 'Medicines', ur: 'ادویات' }
    },
    {
      id: 'pos',
      icon: ShoppingCart,
      label: { en: 'POS/Sales', ur: 'سیلز' }
    },
    {
      id: 'inventory',
      icon: Package,
      label: { en: 'Inventory', ur: 'انوینٹری' }
    },
    {
      id: 'reports',
      icon: FileText,
      label: { en: 'Reports', ur: 'رپورٹس' }
    },
    {
      id: 'settings',
      icon: Settings,
      label: { en: 'Settings', ur: 'سیٹنگز' }
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Pill className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {isUrdu ? 'فارمیسی' : 'Pharmacy'}
            </h1>
            <p className="text-sm text-gray-600">
              {isUrdu ? 'منیجمنٹ' : 'Management'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${isUrdu ? 'flex-row-reverse' : ''}`}
              onClick={() => setActiveModule(item.id)}
            >
              <Icon className={`h-4 w-4 ${isUrdu ? 'ml-2' : 'mr-2'}`} />
              {isUrdu ? item.label.ur : item.label.en}
            </Button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-gray-100 p-2 rounded-full">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
            <p className="text-xs text-gray-600 capitalize">{currentUser.role}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isUrdu ? 'لاگ آؤٹ' : 'Logout'}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
