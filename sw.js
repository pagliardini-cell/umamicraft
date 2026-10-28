// Service Worker de UmamiCraft (PWA con soporte offline y caché inteligente)
const CACHE_NAME = 'umamicraft-v1.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
  '/recetas_pro.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
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

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo peticiones GET
  if (req.method !== 'GET') return;

  // Ignorar analytics, extensiones y admin
  if (url.origin.includes('google-analytics') || url.origin.includes('googletagmanager') || url.pathname.startsWith('/admin')) {
    return;
  }

  // 1. recetas_pro.json: Red primero, respaldo en caché para modo offline
  if (url.pathname.includes('recetas_pro.json')) {
    event.respondWith(
      fetch(req)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return response;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // 2. Imágenes: Caché primero con actualización en segundo plano
  if (req.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|webp|svg|ico)$/i)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        }).catch(() => cached);
      })
    );
    return;
  }

  // 3. Documentos y estáticos: Caché primero, fallback a red
  event.respondWith(
    caches.match(req).then((cached) => {
      return cached || fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200 && url.origin === self.location.origin) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkRes;
      });
    }).catch(() => {
      if (req.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});
