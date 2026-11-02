// Service Worker de UmamiCraft (PWA v4.0 - Network First para imágenes para forzar actualización en móviles)
const CACHE_NAME = 'umamicraft-v4.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json?v=4',
  '/icon-192.png?v=4',
  '/icon-512.png?v=4',
  '/apple-touch-icon.png?v=4',
  '/favicon.svg?v=4',
  '/favicon.png?v=4',
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
            console.log('[PWA] Eliminando caché obsoleta:', key);
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

  // 1. Navegación y Documentos HTML (Deep links y rutas limpias /receta/*): Red Primero (Network-First)
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

  // 2. recetas_pro.json: Red primero, respaldo en caché para modo offline
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

  // 3. Imágenes: RED PRIMERO (Network-First) para que el celular siempre muestre la foto actualizada
  if (req.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|webp|svg|ico)$/i)) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // 4. Otros estáticos: Caché primero con fallback a red
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
