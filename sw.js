/* Logist · funcionamiento sin internet.
   Al publicar cambios, sube el número de VERSION para que los celulares se actualicen. */
const VERSION = 'logist-v1';
const FILES = [
  './', './index.html', './manifest.webmanifest',
  './vendor/jspdf.umd.min.js', './vendor/jspdf.plugin.autotable.min.js',
  './fonts/montserrat-400.woff2', './fonts/montserrat-500.woff2', './fonts/montserrat-600.woff2',
  './fonts/cormorant-500.woff2', './fonts/cormorant-600.woff2', './fonts/cormorant-700.woff2',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png', './icons/favicon.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(VERSION).then(async c => {
      const hit = await c.match(r, { ignoreSearch: true });
      const net = fetch(r).then(res => { if (res && res.ok) c.put(r, res.clone()); return res; }).catch(() => null);
      if (hit) { e.waitUntil(net); return hit; }
      return (await net) || (r.mode === 'navigate' ? c.match('./index.html') : Response.error());
    })
  );
});
