// Pop Pop Play offline cache. CACHE changes with every version, so phones pick up updates.
const CACHE = "poppop-1.4-5";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Cache first: the game never needs the internet once it is saved.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true })
    .then(hit => hit || (e.request.mode === "navigate" ? caches.match("index.html") : null))
    .then(hit => hit || fetch(e.request)));
});
