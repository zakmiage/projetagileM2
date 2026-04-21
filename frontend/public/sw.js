// ProjetAgile M2 - Service Worker
// Stratégie : Cache-First pour les assets, Network-First avec fallback IndexedDB pour l'API

const CACHE_NAME = 'projetagile-v1';
const API_CACHE_NAME = 'projetagile-api-v1';

// Assets statiques à mettre en cache lors de l'installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Routes angulaires à mettre en cache pour le mode hors ligne
const ANGULAR_ROUTES = [
  '/login',
  '/dashboard',
  '/events',
  '/members',
  '/settings',
];

// ─── Installation ────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing ProjetAgile Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...STATIC_ASSETS, ...ANGULAR_ROUTES]);
    }).then(() => {
      console.log('[SW] Static assets cached successfully');
      return self.skipWaiting();
    }).catch((err) => {
      console.warn('[SW] Cache addAll partial failure (some routes may not exist yet):', err);
      return self.skipWaiting();
    })
  );
});

// ─── Activation ──────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ─── Fetch Strategy ──────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET et les extensions de navigateur
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Requêtes API → Network-First avec mise en cache de la réponse
  if (url.pathname.startsWith('/api') || url.hostname === 'localhost' && url.port === '3000') {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // Assets angulaires → Cache-First avec fallback réseau
  event.respondWith(cacheFirstWithNetwork(request));
});

// Stratégie : Network-First (tente réseau, fallback cache)
async function networkFirstWithCache(request) {
  const cache = await caches.open(API_CACHE_NAME);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    console.warn('[SW] Network failed, serving from API cache:', request.url);
    const cached = await cache.match(request);
    if (cached) return cached;
    // Retourner une réponse d'erreur structurée pour que l'app puisse la gérer
    return new Response(
      JSON.stringify({ success: false, offline: true, data: [], message: 'Hors ligne - données en cache non disponibles' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Stratégie : Cache-First (sert depuis le cache, sinon réseau)
async function cacheFirstWithNetwork(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    // Fallback vers index.html pour les routes Angular (SPA)
    console.warn('[SW] Network failed for:', request.url, '- serving index.html');
    const indexFallback = await cache.match('/index.html');
    return indexFallback || new Response('Application hors ligne', { status: 503 });
  }
}

// ─── Messages du client ───────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
