/* DailyLife service worker.
   Required for two things:
   1) Letting Android/Chrome show notifications (mobile browsers reject the plain
      `new Notification()` constructor and require ServiceWorkerRegistration.showNotification()).
   2) Meeting the "installable PWA" criteria on Android (Add to Home Screen).
   This file must be hosted alongside dailylife.html (same folder) for either to work —
   opening dailylife.html directly as a local file (file://) cannot register a service worker at all;
   that's a browser security restriction, not a bug in this app. */

const CACHE_NAME = 'dailylife-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Basic passthrough fetch handler — required by some browsers as part of the
// "installable" criteria. We don't attempt custom offline caching here since
// all real data lives in localStorage, not in fetched resources.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

// Tapping a notification focuses an existing DailyLife tab if one is open,
// otherwise opens a new one.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
