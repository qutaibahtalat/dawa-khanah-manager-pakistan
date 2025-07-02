
import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Wifi, 
  WifiOff, 
  Moon, 
  Sun,
  Bell,
  Settings,
  User
} from 'lucide-react';

interface EnhancedHeaderProps {
  isUrdu: boolean;
  setIsUrdu: (value: boolean) => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (value: boolean) => void;
  currentUser?: any;
  onProfileClick?: () => void;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
}

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({
  isUrdu,
  setIsUrdu,
  isDarkMode = false,
  setIsDarkMode,
  currentUser,
  onProfileClick,
  onNotificationsClick,
  onSettingsClick
}) => {
  const { settings } = useSettings();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const text = {
    en: {
      language: 'English',
      online: 'Online',
      offline: 'Offline',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      notifications: 'Notifications',
      profile: 'Profile',
      settings: 'Settings'
    },
    ur: {
      language: 'اردو',
      online: 'آن لائن',
      offline: 'آف لائن',
      darkMode: 'ڈارک موڈ',
      lightMode: 'لائٹ موڈ',
      notifications: 'اطلاعات',
      profile: 'پروفائل',
      settings: 'سیٹنگز'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  return (
    <div className="flex items-center justify-between p-4 bg-background border-b">
      <div className="flex items-center space-x-4">
        <h1 className="text-title font-poppins">
          <span className="text-xl font-bold truncate max-w-xs">
            {settings.companyName || 'Pharmacy'}
          </span>
        </h1>
        <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center space-x-1">
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          <span>{isOnline ? t.online : t.offline}</span>
        </Badge>
      </div>

      <div className="flex items-center space-x-2">
        {/* Language Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsUrdu(!isUrdu)}
          className="flex items-center space-x-2"
        >
          <Globe className="h-4 w-4" />
          <span>{t.language}</span>
        </Button>

        {/* Dark Mode Toggle */}
        {setIsDarkMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center space-x-2"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="hidden md:inline">
              {isDarkMode ? t.lightMode : t.darkMode}
            </span>
          </Button>
        )}

        {/* Notifications */}
        {onNotificationsClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onNotificationsClick}
            className="relative"
          >
            <Bell className="h-4 w-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>
        )}

        {/* Settings */}
        {onSettingsClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSettingsClick}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}

        {/* User Profile */}
        {currentUser && onProfileClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onProfileClick}
            className="flex items-center space-x-2"
          >
            <User className="h-4 w-4" />
            <span className="hidden md:inline">{currentUser.name}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default EnhancedHeader;
