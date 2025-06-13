
const CACHE_NAME = 'pharmacare-pos-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // Sync offline data when connection is restored
  const offlineData = await getOfflineData();
  if (offlineData && offlineData.length > 0) {
    // Send to server when online
    try {
      await fetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(offlineData),
        headers: { 'Content-Type': 'application/json' }
      });
      clearOfflineData();
    } catch (error) {
      console.log('Sync failed, will retry');
    }
  }
}
