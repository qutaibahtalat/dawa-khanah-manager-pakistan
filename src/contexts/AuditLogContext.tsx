import React, { createContext, useContext, useState } from 'react';
import { useSettings } from './SettingsContext';

type AuditLogAction = 
  'LOGIN' | 'LOGOUT' | 
  'ADD_MEDICINE' | 'EDIT_MEDICINE' | 'DELETE_MEDICINE' |
  'ADD_SUPPLIER' | 'EDIT_SUPPLIER' | 'DELETE_SUPPLIER' |
  'ADD_CUSTOMER' | 'EDIT_CUSTOMER' | 'DELETE_CUSTOMER' |
  'ADD_BRANCH' | 'EDIT_BRANCH' | 'DELETE_BRANCH' |
  'ADD_USER' | 'EDIT_USER' | 'DELETE_USER';

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditLogAction;
  entityType?: string;
  entityId?: string;
  details: string;
  ipAddress?: string;
}

interface AuditLogContextType {
  logs: AuditLog[];
  logAction: (action: AuditLogAction, details: string, entityType?: string, entityId?: string) => void;
  clearLogs: () => void;
}

const AuditLogContext = createContext<AuditLogContextType>({
  logs: [],
  logAction: () => {},
  clearLogs: () => {}
});

export const AuditLogProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const { settings } = useSettings();

  const logAction = (action: AuditLogAction, details: string, entityType?: string, entityId?: string) => {
    const user = JSON.parse(localStorage.getItem('pharmacy_user') || '{}');
    
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      userId: user.id || 'unknown',
      userName: user.name || 'unknown',
      userRole: user.role || 'unknown',
      action,
      entityType,
      entityId,
      details,
      ipAddress: settings.logIpAddresses ? '127.0.0.1' : undefined // In real app, get actual IP
    };

    setLogs(prev => [newLog, ...prev].slice(0, 1000)); // Keep last 1000 logs
    
    // In production, you would also save to database/API here
    console.log(`[AUDIT] ${newLog.timestamp.toISOString()} - ${newLog.userName} (${newLog.userRole}) ${action}: ${details}`);
  };

  const clearLogs = () => setLogs([]);

  return (
    <AuditLogContext.Provider value={{ logs, logAction, clearLogs }}>
      {children}
    </AuditLogContext.Provider>
  );
};

export const useAuditLog = () => useContext(AuditLogContext);
