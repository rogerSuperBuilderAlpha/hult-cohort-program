const CACHE = 'relay65-shell-v6';
const SHELL = [
  './', './index.html', './styles.css', './manifest.webmanifest',
  './src/app.js', './src/icons.js', './src/utils.js', './src/data.js',
  './src/adapters/demo.js', './src/adapters/firebase.js',
  './assets/relay-mark.svg', './assets/relay-icon-192.png', './assets/relay-icon-512.png',
  './assets/demo-wireframe.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, fallback = './index.html', options) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request, options);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || cache.match(fallback);
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request, './index.html', { cache: 'no-store' }));
    return;
  }

  if (url.pathname.endsWith('/config.js')) {
    event.respondWith(networkFirst(event.request, './config.js', { cache: 'no-store' }));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const refresh = fetch(event.request).then((response) => {
        if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
        return response;
      });
      return cached || refresh;
    })
  );
});
