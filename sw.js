const CACHE_NAME = 'yapigucbeton-v3';
const STATIC_CACHE = 'yapigucbeton-static-v3';
const DYNAMIC_CACHE = 'yapigucbeton-dynamic-v3';

// Kritik statik dosyalar - her zaman cache'le
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/hakkimizda.html',
  '/bayi-giris.html',
  '/manifest.json',
  '/favicon.png',
  '/logo.png',
  '/apple-touch-icon.png',
  '/robots.txt',
  '/sitemap.xml',
];

// Blog sayfaları - cache'le
const BLOG_PAGES = [
  '/parke-tasi-nasil-dosenir.html',
  '/2026-hatay-parke-tasi-fiyatlari.html',
  '/parke-tasi-maliyeti.html',
  '/hatay-parke-tasi-firmalari.html',
  '/beton-bariyer-cesitleri.html',
  '/hatay-parke-tasi.html',
  '/ar.html',
];

// Install - statik dosyaları cache'le
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll([...STATIC_ASSETS, ...BLOG_PAGES]);
    }).catch(err => console.log('Cache install error:', err))
  );
});

// Activate - eski cache'leri temizle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => ![STATIC_CACHE, DYNAMIC_CACHE].includes(key))
          .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// Fetch - Cache First stratejisi
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Sadece GET isteklerini cache'le
  if (event.request.method !== 'GET') return;
  
  // Harici API'leri cache'leme
  if (!url.origin.includes('yapigucbeton.com.tr') && 
      !url.origin.includes('github.io')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Cache'den sun, arka planda güncelle
        fetch(event.request).then(response => {
          if (response && response.status === 200) {
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, response.clone());
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      
      // Cache'de yoksa network'ten al
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Push notification (gelecek için hazır)
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'Yapıgüç Beton', {
    body: data.body || 'Yeni bildirim',
    icon: '/logo.png',
    badge: '/favicon.png',
    data: { url: data.url || '/' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});