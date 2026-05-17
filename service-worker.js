const CACHE_NAME = "codequest-pwa-v1";

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/src/quests.js",
  "/src/main.js",
  "/vendor/gsap.min.js",
  "/vendor/pixi.min.js",
  "/vendor/howler.min.js",
  "/vendor/matter.min.js",
  "/vendor/three.module.min.js",
  "/manifest.webmanifest",
  "/assets/codequest-roadmap-clean.png",
  "/assets/codequest-logo-reference-alpha.png",
  "/assets/hero-adventurer-sprite-trimmed.png",
  "/assets/guide-wizard-generated.png",
  "/assets/pwa-icon-192.png",
  "/assets/pwa-icon-512.png",
  "/assets/pwa-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", copy));
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }

        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
