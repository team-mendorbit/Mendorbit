// Mendorbit Enterprise Admin Service Worker (v2.4.0)
const CACHE_NAME = 'mendorbit-admin-pwa-v2.4.0';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Never intercept or cache real-time Firestore, Firebase Auth, or Google Sheet Webhook calls
  const url = event.request.url;
  if (
    event.request.method !== 'GET' ||
    url.includes('script.google.com') ||
    url.includes('firestore.googleapis.com') ||
    url.includes('identitytoolkit.googleapis.com') ||
    url.includes('securetoken.googleapis.com')
  ) {
    return;
  }

  // Network-first strategy with local fallback for static assets
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
