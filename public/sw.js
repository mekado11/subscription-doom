// SubDoom Service Worker — enables offline & installability
const CACHE = 'subdoom-v1'

// On install: cache the app shell
self.addEventListener('install', e => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(CACHE).then(c =>
      c.addAll(['/', '/manifest.webmanifest', '/icon-192.svg', '/icon-512.svg'])
    )
  )
})

// On activate: clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  )
})

// Fetch: network-first for navigation, cache-first for assets
self.addEventListener('fetch', e => {
  const { request } = e
  const url = new URL(request.url)

  // Only handle same-origin requests
  if (url.origin !== location.origin) return

  if (request.mode === 'navigate') {
    // Navigation: try network, fall back to cached index
    e.respondWith(
      fetch(request).catch(() =>
        caches.match('/').then(r => r ?? fetch(request))
      )
    )
    return
  }

  // Static assets: cache-first
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response
        const clone = response.clone()
        caches.open(CACHE).then(c => c.put(request, clone))
        return response
      })
    })
  )
})
