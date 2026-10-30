/* FESTÉKINDEX — minimal service worker for PWA installability.
 * Network-first for navigations; no aggressive offline cache.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Required for installability; pass through to network.
  event.respondWith(fetch(event.request));
});
