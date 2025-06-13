
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

// Enable app install prompt
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install button or banner
  const installButton = document.createElement('button');
  installButton.textContent = 'Install PharmaCare POS';
  installButton.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 1000;
    background: #0057A5;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-family: Poppins, sans-serif;
  `;
  
  installButton.addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
        document.body.removeChild(installButton);
      });
    }
  });
  
  document.body.appendChild(installButton);
});

createRoot(document.getElementById("root")!).render(<App />);
