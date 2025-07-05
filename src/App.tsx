import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from 'react-router-dom';
import { SettingsProvider } from "./contexts/SettingsContext";
import { InventoryProvider } from "./contexts/InventoryContext";
import { AuditLogProvider } from "./contexts/AuditLogContext";
import { DataProvider } from "./contexts/DataContext";
import { AuthProvider } from "./contexts/AuthContext";
import { router } from './routes';
import { useState, useCallback } from 'react';
import SessionTimeoutModal from './components/SessionTimeoutModal';
import { useSessionTimeout } from './hooks/useSessionTimeout';

const queryClient = new QueryClient();

import ErrorBoundary from './ErrorBoundary';

export default function App({ children }: { children?: React.ReactNode }) {
  const [timeoutOpen, setTimeoutOpen] = useState(false);
  const handleTimeout = useCallback(() => setTimeoutOpen(true), []);
  const handleLoginAgain = useCallback(() => {
    setTimeoutOpen(false);
    window.location.reload();
  }, []);
  useSessionTimeout(15 * 60 * 1000, handleTimeout); // 15 minutes

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <SettingsProvider>
              <InventoryProvider>
                <AuditLogProvider>
                  <DataProvider>
                    {children}
                  </DataProvider>
                </AuditLogProvider>
              </InventoryProvider>
            </SettingsProvider>
          </AuthProvider>
          <SessionTimeoutModal open={timeoutOpen} onLogin={handleLoginAgain} />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
