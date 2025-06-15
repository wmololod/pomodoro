const CACHE_NAME = 'pomodoro-pwa-v1';
const urlsToCache = [
  '/pomodoro/',
  '/pomodoro/index.html',
  '/pomodoro/manifest.json',
  '/pomodoro/icon-192.png',
  '/pomodoro/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
