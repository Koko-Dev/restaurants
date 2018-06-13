var staticCacheName = 'restaurants-65';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName)
          .then(cache => {
            return cache
              .addAll([
                '/',
                '/index.html',
                '/js/main.js',
                '/css/styles.css',
                '/restaurant.html',
                '/js/dbhelper.js',
                '/restaurant_info.js',
                '/data/restaurants.json',
                '/img/1.jpg',
                '/img/2.jpg',
                '/img/3.jpg',
                '/img/4.jpg',
                '/img/5.jpg',
                '/img/6.jpg',
                '/img/7.jpg',
                '/img/8.jpg',
                '/img/9.jpg',
                '/img/10.jpg',
              ])
              .catch(error => {
                console.log('Cache addAl from sw.js failed', error);
              })
          })
  )
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('restaurants-') && cacheName != staticCacheName;
      }).map(cacheName => {
        return caches.delete(cacheName);
        
        })
      )
    })
  )
});


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if(response) {
        // console.log('The event.request was found in the cache');
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



