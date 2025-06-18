// sw.js

// Имя для кеша
const CACHE_NAME = 'pomodoro-cache-v1';

// Файлы для кеширования
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/woosh.mp3'
];

// Установка Service Worker и кеширование ресурсов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Перехват запросов для использования кеша
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если ответ найден в кеше, возвращаем его
        if (response) {
          return response;
        }
        // В противном случае, делаем сетевой запрос
        return fetch(event.request);
      }
    )
  );
});

// Обработка сообщений от клиента
let timerInterval;
let remainingTime = 30 * 60; // Начальное время
let isRunning = false;
let startTime;

self.addEventListener('message', (event) => {
  if (event.data.action === 'start') {
    startTime = Date.now();
    isRunning = true;
    remainingTime = event.data.timeLeft;

    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      remainingTime = remainingTime - elapsed;

      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        // Отправляем сообщение клиенту о завершении таймера
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ action: 'timerEnd' });
          });
        });
      }
    }, 1000);
  } else if (event.data.action === 'pause') {
    clearInterval(timerInterval);
    isRunning = false;
  }
});

// Обработка сообщений от клиента о завершении таймера
self.addEventListener('message', (event) => {
  if (event.data.action === 'timerEnd') {
    clearInterval(timerInterval);
    isRunning = false;
  }
});
