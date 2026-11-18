// Pop Pop Play offline cache. CACHE changes with every version, so phones pick up updates.
const CACHE = "poppop-1.4.8-8";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];

self.addEventListener("install", e => {
  // cache: "reload" skips the browser's short-term cache, so the saved copy is really the new version.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.mode === "navigate") {
    // The game page: fresh when online (so updates show at once), the saved copy when offline.
    e.respondWith(fetch(e.request.url, { cache: "no-cache" })   // always check with the server
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put("index.html", copy)); }
        return res;
      })
      .catch(() => caches.match("index.html")));
    return;
  }
  // Icons and the manifest: saved copy first.
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
