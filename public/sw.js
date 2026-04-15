const CACHE = 'iqra-v1';
const STATIC = ['/', '/data/words.json', '/logo.svg', '/favicon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Cache audio files on first play
  if (url.hostname === 'audio.qurancdn.com') {
    e.respondWith(caches.open(CACHE).then(c =>
      c.match(e.request).then(r => r || fetch(e.request).then(res => {
        if (res.ok) c.put(e.request, res.clone());
        return res;
      }))
    ));
    return;
  }
  // Network first for API calls
  if (url.hostname === 'api.quran.com') {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Cache first for static assets
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
