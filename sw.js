// Mendorbit Official Progressive Web App Service Worker
// Version: 2.5.0
const CACHE_NAME = 'mendorbit-pwa-v2.5.0';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// App-branded Notification Click Handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) 
    ? event.notification.data.url 
    : 'index.html';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing open tab if available
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // If no tab is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Web Push Event Handler
self.addEventListener('push', (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { title: 'Mendorbit', body: event.data.text() };
    }
  }

  const title = payload.title || 'Mendorbit';
  const options = {
    body: payload.body || 'New live update from Mendorbit faculty.',
    icon: 'assets/images/icons/icon-192.png',
    badge: 'assets/images/icons/icon-192.png',
    image: payload.image || undefined,
    vibrate: [100, 50, 100],
    data: { url: payload.url || 'index.html' },
    actions: [
      { action: 'open', title: 'Open Mendorbit' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Fetch passthrough
self.addEventListener('fetch', (event) => {
  // Let browser and Firestore handle network requests natively
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
