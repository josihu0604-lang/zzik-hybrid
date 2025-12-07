/**
 * ZZIK Service Worker v3
 * Popup Crowdfunding Platform - "참여하면 열린다"
 *
 * Caching Strategies:
 * - Static assets: Cache first (fonts, icons)
 * - Pages: Stale while revalidate (HTML)
 * - API: Network only (real-time data)
 * - Images: Cache first with network update
 * - CSS/JS: Stale while revalidate
 */

const CACHE_VERSION = 3;
const CACHE_NAMES = {
  static: `zzik-static-v${CACHE_VERSION}`,
  pages: `zzik-pages-v${CACHE_VERSION}`,
  images: `zzik-images-v${CACHE_VERSION}`,
  runtime: `zzik-runtime-v${CACHE_VERSION}`,
};

// Static assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/favicon.svg',
];

// Page routes to cache
const PAGE_ROUTES = ['/', '/map', '/me', '/onboarding'];

// ============================================
// Installation
// ============================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v' + CACHE_VERSION);

  event.waitUntil(
    Promise.all([
      // Precache static assets
      caches.open(CACHE_NAMES.static).then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn('[SW] Precache failed for some assets:', err);
        });
      }),
    ])
  );

  // Take control immediately
  self.skipWaiting();
});

// ============================================
// Activation
// ============================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v' + CACHE_VERSION);

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        const validCaches = Object.values(CACHE_NAMES);
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('zzik-') && !validCaches.includes(name))
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      }),
    ])
  );

  // Take control of all clients
  self.clients.claim();
});

// ============================================
// Fetch Handling
// ============================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http
  if (!url.protocol.startsWith('http')) return;

  // API requests - network only
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkOnly(request));
    return;
  }

  // External resources - network first
  if (url.origin !== self.location.origin) {
    event.respondWith(networkFirst(request, CACHE_NAMES.runtime));
    return;
  }

  // Static assets (fonts, icons) - cache first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.static));
    return;
  }

  // Images - cache first with revalidation
  if (isImage(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.images));
    return;
  }

  // CSS/JS - stale while revalidate
  if (isBuildAsset(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.static));
    return;
  }

  // Navigation requests - network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, CACHE_NAMES.pages).catch(() => {
        return caches.match('/offline') || caches.match('/');
      })
    );
    return;
  }

  // Default - stale while revalidate
  event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.runtime));
});

// ============================================
// Caching Strategies
// ============================================

/**
 * Network only - for API requests
 */
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Network error' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Cache first - for static assets
 */
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Asset not available offline', { status: 503 });
  }
}

/**
 * Network first - for pages
 */
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Stale while revalidate - for runtime assets
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// ============================================
// Helper Functions
// ============================================

function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/fonts/') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname === '/manifest.json'
  );
}

function isImage(pathname) {
  return (
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.avif')
  );
}

function isBuildAsset(pathname) {
  return pathname.startsWith('/_next/') || pathname.endsWith('.css') || pathname.endsWith('.js');
}

// ============================================
// Background Sync
// ============================================

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  switch (event.tag) {
    case 'sync-participations':
      event.waitUntil(syncParticipations());
      break;
    case 'sync-checkins':
      event.waitUntil(syncCheckIns());
      break;
    case 'sync-bookmarks':
      event.waitUntil(syncBookmarks());
      break;
  }
});

async function syncParticipations() {
  // Get pending participations from IndexedDB
  const pendingActions = await getPendingSyncActions('participations');

  for (const action of pendingActions) {
    try {
      await fetch(action.endpoint, {
        method: action.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data),
      });
      await removeSyncAction(action.id);
    } catch (error) {
      console.error('[SW] Sync participation failed:', error);
    }
  }
}

async function syncCheckIns() {
  const pendingActions = await getPendingSyncActions('checkins');

  for (const action of pendingActions) {
    try {
      await fetch(action.endpoint, {
        method: action.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data),
      });
      await removeSyncAction(action.id);
    } catch (error) {
      console.error('[SW] Sync check-in failed:', error);
    }
  }
}

async function syncBookmarks() {
  const pendingActions = await getPendingSyncActions('bookmarks');

  for (const action of pendingActions) {
    try {
      await fetch(action.endpoint, {
        method: action.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data),
      });
      await removeSyncAction(action.id);
    } catch (error) {
      console.error('[SW] Sync bookmark failed:', error);
    }
  }
}

// ============================================
// IndexedDB Access from Service Worker
// ============================================

const DB_NAME = 'zzik-db';
const DB_VERSION = 1;
const STORE_QUEUE = 'sync-queue';

/**
 * Open IndexedDB
 */
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get pending sync actions from IndexedDB
 */
async function getPendingSyncActions(type) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction([STORE_QUEUE], 'readonly');
    const store = transaction.objectStore(STORE_QUEUE);

    return new Promise((resolve, reject) => {
      let request;
      if (type) {
        const index = store.index('type');
        request = index.getAll(type);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[SW] Failed to get pending actions:', error);
    return [];
  }
}

/**
 * Remove sync action from IndexedDB
 */
async function removeSyncAction(id) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction([STORE_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORE_QUEUE);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[SW] Failed to remove action:', error);
    return false;
  }
}

// ============================================
// Push Notifications
// ============================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  if (!event.data) return;

  try {
    const data = event.data.json();

    const options = {
      body: data.body || data.message,
      icon: data.icon || '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: data.tag || 'zzik-notification',
      data: {
        url: data.url || '/',
        ...data.data,
      },
      vibrate: [100, 50, 100],
      actions: data.actions || [
        { action: 'open', title: '열기' },
        { action: 'close', title: '닫기' },
      ],
      requireInteraction: data.requireInteraction || false,
    };

    // Different icons based on notification type
    if (data.type === 'participation') {
      options.icon = '/icons/notification-participate.png';
    } else if (data.type === 'confirmed') {
      options.icon = '/icons/notification-confirmed.png';
    } else if (data.type === 'deadline') {
      options.icon = '/icons/notification-deadline.png';
      options.requireInteraction = true;
    }

    event.waitUntil(self.registration.showNotification(data.title, options));
  } catch (error) {
    console.error('[SW] Push notification error:', error);
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// ============================================
// Message Handler
// ============================================

self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  switch (event.data?.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CACHE_URLS':
      event.waitUntil(cacheUrls(event.data.urls));
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(clearAllCaches());
      break;

    case 'GET_CACHE_SIZE':
      event.waitUntil(
        getCacheSize().then((size) => {
          event.ports[0]?.postMessage({ size });
        })
      );
      break;
  }
});

async function cacheUrls(urls) {
  const cache = await caches.open(CACHE_NAMES.pages);
  for (const url of urls) {
    try {
      await cache.add(url);
    } catch (error) {
      console.warn('[SW] Failed to cache:', url, error);
    }
  }
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
  console.log('[SW] All caches cleared');
}

async function getCacheSize() {
  let totalSize = 0;
  const cacheNames = await caches.keys();

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.clone().blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}

console.log('[SW] Service Worker v' + CACHE_VERSION + ' loaded');
