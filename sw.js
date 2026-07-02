// ============ SERVICE WORKER CƠ BẢN CHO PREMIUM CINEMA ============
// Chỉ cache "khung" ứng dụng (app shell), KHÔNG cache dữ liệu phim/API
// để tránh phim mới không cập nhật được.

const CACHE_NAME = 'premium-cinema-shell-v1';
const APP_SHELL = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Không can thiệp vào gọi API phim (luôn lấy dữ liệu mới nhất từ mạng)
  if (url.hostname.includes('phimapi.com') || url.hostname.includes('img.phimapi.com')) {
    return;
  }

  // Chỉ xử lý cache cho các request GET cùng gốc (app shell, font, ảnh tĩnh)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => cached);
    })
  );
});
