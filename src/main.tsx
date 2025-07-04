import 'react-datepicker/dist/react-datepicker.css';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import ErrorBoundary from './ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { SettingsProvider } from './contexts/SettingsContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { AuditLogProvider } from './contexts/AuditLogContext';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient();

// Register service worker for PWA functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
        
        // Enable background sync - check if sync is supported
        if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype) {
          navigator.serviceWorker.ready.then(swRegistration => {
            return (swRegistration as any).sync.register('background-sync');
          }).catch(err => {
            console.log('Background sync registration failed:', err);
          });
        }
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// App install prompt has been removed as per user request

createRoot(document.getElementById("root")!).render(
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
                  <RouterProvider router={router} />
                </DataProvider>
              </AuditLogProvider>
            </InventoryProvider>
          </SettingsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

