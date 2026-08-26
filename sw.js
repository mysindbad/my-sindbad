// <!-- M7-PERFORMANCE-SW -->
const CACHE_NAME = 'my-sindbad-v40';
const APP_SHELL = [
  './',
  './index.html',
  './itinerary.html',
  './map.html'
];

function isShellRequest(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  return APP_SHELL.some((entry) => new URL(entry, self.location.href).pathname === url.pathname);
}

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
  if (event.request.method !== 'GET' || !isShellRequest(event.request)) return;
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
