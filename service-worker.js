const CACHE_NAME = 'samlan-fee-offline-v3';

// 1. เก็บเฉพาะไฟล์ "ในเครื่อง" เท่านั้น (เอา CDN ของชาวบ้านออกให้หมด เพื่อแก้ปัญหา CORS)
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.json',
  './img/icon.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache and precaching LOCAL assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 2. ระบบดักจับการดึงไฟล์แบบ "โหลดแล้วจำ" (Dynamic Caching)
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // ข้ามส่วนขยายของเบราว์เซอร์
  if (requestUrl.protocol === 'chrome-extension:') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // มีในแคชแล้ว เอาไปใช้เลย (ออฟไลน์ก็ใช้ได้)
      if (cachedResponse) {
        return cachedResponse;
      }

      // ถ้าไม่มี ให้โหลดจากเน็ต
      return fetch(event.request).then(networkResponse => {
        // อนุญาตให้เซฟไฟล์จาก CDN ได้ (ยอมรับทั้ง status 200 ปกติ และ status 0 แบบ Opaque/CORS)
        if (!networkResponse || (networkResponse.status !== 200 && networkResponse.status !== 0)) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          // แอบเซฟไฟล์ CDN ลงแคชตอนที่โหลดสำเร็จ
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(error => {
        console.error('Fetch failed (Network Offline):', error);
      });
    })
  );
});