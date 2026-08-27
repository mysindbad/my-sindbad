// <!-- M7-MULTIPAGE-OFFLINE -->
const CACHE_NAME = 'my-sindbad-v41';
const APP_SHELL = [
  './',
  './index.html',
  './create-trip.html',
  './itinerary.html',
  './explore.html',
  './map.html',
  './profile.html',
  './today.html',
  './community.html',
  './view.html',
  './privacy.html',
  './login.html'
];

const STATIC_ASSETS = [
  './manifest.json',
  './app.css',
  './theme.css',
  './theme.js',
  './icons/brand-logo.jpg',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './images/chefchaouen.jpg',
  './images/hotel-1.jpg',
  './images/hotel-2.jpg',
  './images/hotel-3.jpg',
  './images/hotel-4.jpg',
  './images/hotel-5.jpg',
  './images/hotel-6.jpg',
  './images/istanbul.jpg',
  './images/marrakech.jpg',
  './images/resto-1.jpg',
  './images/resto-2.jpg',
  './images/resto-3.jpg',
  './images/resto-4.jpg',
  './images/resto-5.jpg',
  './images/resto-6.jpg',
  './utils/appState.js',
  './utils/auth.js',
  './utils/cityImages.js',
  './utils/geocode.js',
  './utils/header.css',
  './utils/header.js',
  './utils/i18n.js?m6=final1',
  './utils/navigation.css',
  './utils/navigation.js',
  './utils/supabaseClient.js',
  './utils/timeUtils.js'
];

const PRECACHE = [...APP_SHELL, ...STATIC_ASSETS];

const CLEAN_URLS = {
  '/': './index.html',
  '/explore': './explore.html',
  '/map': './map.html',
  '/itinerary': './itinerary.html',
  '/create-trip': './create-trip.html',
  '/profile': './profile.html',
  '/today': './today.html',
  '/community': './community.html',
  '/view': './view.html',
  '/privacy': './privacy.html',
  '/login': './login.html'
};

function sameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

function cacheKeyFor(request) {
  const url = new URL(request.url);
  return CLEAN_URLS[url.pathname] ? new URL(CLEAN_URLS[url.pathname], self.location.href).href : request;
}

function isPrecacheRequest(request) {
  if (!sameOrigin(request)) return false;
  const cacheKey = cacheKeyFor(request);
  const pathname = new URL(typeof cacheKey === 'string' ? cacheKey : cacheKey.url).pathname;
  return PRECACHE.some((entry) => new URL(entry, self.location.href).pathname === pathname);
}

async function networkFirst(request) {
  const cacheKey = cacheKeyFor(request);
  const cached = await caches.match(cacheKey, { ignoreSearch: true });
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(cacheKey, copy)).catch(() => {});
    }
    return response;
  } catch (error) {
    return cached || (request.mode === 'navigate' ? caches.match('./index.html') : Response.error());
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('my-sindbad-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !isPrecacheRequest(event.request)) return;
  event.respondWith(networkFirst(event.request));
});
