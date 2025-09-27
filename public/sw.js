/**
 * Service Worker per caching API responses
 * Migliora le performance e supporta offline functionality
 */

const CACHE_NAME = 'code-idea-v1';
const API_CACHE_NAME = 'code-idea-api-v1';

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache First: Per risorse statiche
  CACHE_FIRST: 'cache-first',
  // Network First: Per API calls
  NETWORK_FIRST: 'network-first',
  // Stale While Revalidate: Per documentazione
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// URLs to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/documentation',
  '/api/configurations'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith('/static/')) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle documentation requests
  if (url.pathname.includes('/documentation/') || url.pathname.includes('.md')) {
    event.respondWith(handleDocumentationRequest(request));
    return;
  }

  // Default: Network only
  event.respondWith(fetch(request));
});

/**
 * Handle API requests with Network First strategy
 */
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request.clone());

    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);

    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return error response if no cache
    return new Response(JSON.stringify({
      error: 'Network unavailable and no cached data',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle static assets with Cache First strategy
 */
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', error);
    throw error;
  }
}

/**
 * Handle documentation with Stale While Revalidate
 */
async function handleDocumentationRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Start network request (don't await)
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);

  // Return cached version immediately if available
  if (cachedResponse) {
    networkPromise.catch(() => {}); // Suppress unhandled promise warning
    return cachedResponse;
  }

  // Wait for network if no cache
  return networkPromise;
}

/**
 * Handle background sync for offline actions
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  try {
    // Process any queued API requests
    const pendingRequests = await getStoredRequests();

    for (const requestData of pendingRequests) {
      try {
        await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });

        // Remove successful request from storage
        await removeStoredRequest(requestData.id);
      } catch (error) {
        console.log('[SW] Background sync failed:', error);
      }
    }
  } catch (error) {
    console.log('[SW] Background sync error:', error);
  }
}

/**
 * IndexedDB helpers for offline request storage
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CodeIdeaOffline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('pendingRequests')) {
        db.createObjectStore('pendingRequests', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function getStoredRequests() {
  try {
    const db = await openDB() as IDBDatabase;
    const transaction = db.transaction(['pendingRequests'], 'readonly');
    const store = transaction.objectStore('pendingRequests');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.log('[SW] Error getting stored requests:', error);
    return [];
  }
}

async function removeStoredRequest(id) {
  try {
    const db = await openDB() as IDBDatabase;
    const transaction = db.transaction(['pendingRequests'], 'readwrite');
    const store = transaction.objectStore('pendingRequests');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.log('[SW] Error removing stored request:', error);
  }
}

/**
 * Push notification handling
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Code Idea', options)
  );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});