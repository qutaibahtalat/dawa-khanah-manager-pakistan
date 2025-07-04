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

const queryClient = new QueryClient();

import ErrorBoundary from './ErrorBoundary';

export default function App({ children }: { children?: React.ReactNode }) {
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
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
