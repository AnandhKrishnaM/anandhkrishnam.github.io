// Retires the offline cache of the previous (Jekyll/Chirpy) version of this site.
// Browsers that installed the old service worker fetch this file when they check
// for updates; it deletes every cache it owns, unregisters itself and reloads
// open tabs so they show the current site. This site does not use a service worker.
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (event) {
  event.waitUntil((async function () {
    var keys = await caches.keys();
    await Promise.all(keys.map(function (k) { return caches.delete(k); }));
    await self.registration.unregister();
    var tabs = await self.clients.matchAll({ type: "window" });
    tabs.forEach(function (tab) { tab.navigate(tab.url); });
  })());
});
