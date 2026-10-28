// Mendorbit Enterprise Admin Static Asset Service Worker (v2.5.0)
// High-Speed Static Caching + Automatic Version Purge Engine
// STRICT SECURITY: ZERO DYNAMIC DATA CACHED (Firestore, Firebase Auth, Google Sheets are never cached)

const CACHE_NAME = 'mendorbit-admin-static-v2.5.0';

const PRECACHE_STATIC_ASSETS = [
  'css/admin.css?v=2.5.0',
  'js/admin-auth.js?v=2.5.0',
  'assets/images/logo/logo.png?v=2.4.0',
  'https://unpkg.com/lucide@latest',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Precache notice:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  // Automatic cache cleanup: Whenever version changes, immediately delete ALL older cache buckets
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Auto-purging outdated static cache bucket:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = req.url;

  // 1. STRICT SECURITY GUARD: Never intercept or cache non-GET requests or real-time data APIs
  if (
    req.method !== 'GET' ||
    url.includes('firestore.googleapis.com') ||
    url.includes('identitytoolkit.googleapis.com') ||
    url.includes('securetoken.googleapis.com') ||
    url.includes('script.google.com') ||
    url.includes('google-analytics.com')
  ) {
    return; // Pass through directly to network
  }

  // 2. Never cache HTML pages or navigation requests (ensures page logic, data queries and RBAC guards are always live)
  if (req.mode === 'navigate' || url.endsWith('.html') || (!url.includes('.') && !url.includes('cdn') && !url.includes('unpkg'))) {
    return; // Pass through directly to network
  }

  // 3. Stale-While-Revalidate caching for static scripts, stylesheets, fonts, logos & CDNs
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      // Return instant cached response if available (0ms delay), else wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
