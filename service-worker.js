const CACHE = 'trivault-v11'
const ASSETS = [
  '.',
  'index.html',
  'renderer.js',
  'styles.css',
  'manifest.json',
  'src/crypto-web.js'
]

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE) {
          return caches.delete(key)
        }
      })
    )).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  )
})
