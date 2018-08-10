var staticCacheName = 'restaurants-103';
var cacheURLs = [
  '/',
  '/index.html',
  '/js/main.js',
  '/css/styles2.css',
  '/restaurant.html',
  '/js/dbhelper.js',
  '/js/idb.js',
  '/restaurant_info.js',
  '/img/1.jpg',
  '/img/2.jpg',
  '/img/3.jpg',
  'img/4.jpg',
  '/img/5.jpg',
  '/img/6.jpg',
  '/img/7.jpg',
  '/img/8.jpg',
  '/img/9.jpg',
  '/img/10.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName)
          .then(cache => {
            return cache
              .addAll(cacheURLs);
          })
  )
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] At Activate Event')
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if(staticCacheName.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      )
    })
  )
});

self.addEventListener('fetch', event => {
  console.log("[Service Worker] fetch event in SW");
  event.respondWith(
    caches.match(event.request)
          .then(response => {
      if(response) {
        console.log('The event.request was found in the cache');
        return response;
      }
      return fetch(event.request).then(networkResponse => {
        if(networkResponse === 404) {
          // console.log('The Network Response is: ', networkResponse.status);
          return;
        }
        return caches.open(staticCacheName)
          .then(cache => {
            cache.put(event.request.url,  networkResponse.clone());
            // console.log('The event.request was put in the cache');
            return networkResponse;
          })
      })
    })
      .catch(error => {
        console.log('Error in the fetch event: ', error);
        return;
      })
  )
});



