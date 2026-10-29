// Service Worker de UmamiCraft (PWA v3.0 con soporte offline y navegacin Network-First)
const CACHE_NAME = 'umamicraft-v3.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json?v=3',
  '/icon-192.png?v=3',
  '/icon-512.png?v=3',
  '/apple-touch-icon.png?v=3',
  '/favicon.svg?v=3',
  '/favicon.png?v=3',
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

  // 1. Navegacin y Documentos HTML (Deep links y rutas limpias /receta/*): Red Primero (Network-First)
  if (req.mode === 'navigate' || req.destination === 'document' || url.pathname.startsWith('/receta/') || url.pathname.startsWith('/r/')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200 && url.origin === self.location.origin) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match(req).then((cached) => cached || caches.match('/') || caches.match('/index.html'));
        })
    );
    return;
  }

  // 2. recetas_pro.json: Red primero, respaldo en cach para modo offline
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

  // 3. Imgenes: Cach primero con actualizacin en segundo plano
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

  // 4. Otros estticos: Cach primero con fallback a red
  event.respondWith(
    caches.match(req).then((cached) => {
      return cached || fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200 && url.origin === self.location.origin) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkRes;
      });
    })
  );
});
