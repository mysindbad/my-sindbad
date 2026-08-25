// <!-- QA33-SW -->
const CACHE_NAME = 'my-sindbad-v33';
const APP_SHELL = [
  './',
  './index.html',
  './map.html',
  './itinerary.html',
  './create-trip.html',
  './explore.html',
  './community.html',
  './profile.html',
  './today.html',
  './view.html',
  './manifest.json',
  './utils/i18n.js',
  './utils/sync.js',
  './utils/tripops.js',
  './utils/health.js',
  './utils/proactive.js',
  './utils/share.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const isHtml = event.request.mode === 'navigate' || event.request.destination === 'document' || event.request.url.endsWith('.html');
  if (isHtml) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }))
  );
});
