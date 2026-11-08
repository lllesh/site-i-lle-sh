const C = 'ka-lello-v6-distro';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== C).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // network-first for navigations so the app shell is never stale
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request).then(r => r || caches.match('/'))));
    return;
  }
  e.respondWith(
    caches.open(C).then(async cache => {
      const cached = await cache.match(e.request);
      const net = fetch(e.request).then(r => { if (r && r.status === 200) cache.put(e.request, r.clone()); return r; }).catch(() => cached);
      return cached || net;
    })
  );
});
