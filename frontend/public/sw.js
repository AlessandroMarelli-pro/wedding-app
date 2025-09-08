const CACHE_NAME = 'wedding-app-v1';
const STATIC_CACHE_NAME = 'wedding-static-v1';
const DYNAMIC_CACHE_NAME = 'wedding-dynamic-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/_next/static/css/',
  '/_next/static/js/',
  '/icons/',
  '/images/',
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/wedding',
  '/api/accommodations',
  '/api/program',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker installed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME
            ) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      }),
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        console.log('Serving from cache:', request.url);
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Determine which cache to use
          let cacheToUse = DYNAMIC_CACHE_NAME;

          // Cache API responses
          if (
            API_CACHE_PATTERNS.some((pattern) => url.pathname.includes(pattern))
          ) {
            cacheToUse = DYNAMIC_CACHE_NAME;
          }
          // Cache static assets
          else if (
            STATIC_ASSETS.some((asset) => url.pathname.includes(asset))
          ) {
            cacheToUse = STATIC_CACHE_NAME;
          }

          // Cache the response
          caches
            .open(cacheToUse)
            .then((cache) => {
              console.log('Caching response:', request.url);
              cache.put(request, responseToCache);
            })
            .catch((error) => {
              console.error('Failed to cache response:', error);
            });

          return response;
        })
        .catch((error) => {
          console.error('Fetch failed:', error);

          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }

          // Return a generic error response for other requests
          return new Response('Network error', {
            status: 408,
            statusText: 'Request Timeout',
          });
        });
    }),
  );
});

// Background sync for RSVP submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'rsvp-sync') {
    console.log('Background sync: RSVP submission');
    event.waitUntil(
      // This would sync any pending RSVP submissions
      syncRSVPSubmissions(),
    );
  }
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('Push notification received:', data);

    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: data.actions || [],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  event.notification.close();

  event.waitUntil(clients.openWindow('/'));
});

// Helper function for RSVP sync
async function syncRSVPSubmissions() {
  try {
    // Get pending submissions from IndexedDB
    const pendingSubmissions = await getPendingRSVPSubmissions();

    for (const submission of pendingSubmissions) {
      try {
        const response = await fetch('/api/rsvp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submission.data),
        });

        if (response.ok) {
          // Remove from pending submissions
          await removePendingRSVPSubmission(submission.id);
          console.log('RSVP submission synced successfully');
        }
      } catch (error) {
        console.error('Failed to sync RSVP submission:', error);
      }
    }
  } catch (error) {
    console.error('RSVP sync failed:', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getPendingRSVPSubmissions() {
  // This would retrieve pending submissions from IndexedDB
  return [];
}

async function removePendingRSVPSubmission(id) {
  // This would remove a submission from IndexedDB
  console.log('Removing pending submission:', id);
}
