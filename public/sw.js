const CACHE_NAME = "officebiz-v1"

// Install: cache shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/login", "/icons/icon-192x192.svg", "/icons/icon-512x512.svg"])
    )
  )
  // Activate immediately — don't wait for old tabs to close
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  // Take control of all clients immediately
  self.clients.claim()
})

// Fetch: network-first strategy (always get latest, fallback to cache offline)
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return

  // Skip non-http(s) schemes (chrome-extension://, etc.)
  const url = new URL(event.request.url)
  if (!url.protocol.startsWith("http")) return

  // Skip API calls and auth routes — never cache those
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for offline use
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() =>
        caches.match(event.request).then((cached) =>
          cached || new Response("Offline", { status: 503, statusText: "Service Unavailable" })
        )
      )
  )
})
