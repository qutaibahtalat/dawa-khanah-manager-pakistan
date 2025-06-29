
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

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

createRoot(document.getElementById("root")!).render(<App />);
