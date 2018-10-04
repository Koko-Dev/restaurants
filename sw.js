var staticCacheName = 'restaurants-191';

var cacheURLs = [
  '/',
  '/index.html',
  '/js/main.js',
  '/css/styles2.css',
  '/restaurant.html',
  '/js/dbhelper.js',
  '/js/register.js',
  '/node_modules/idb/lib/idb.js',
  '/js/restaurant_info.js',
  '/img/1.jpg',
  '/img/2.jpg',
  '/img/3.jpg',
  '/img/4.jpg',
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
          .then(cache => cache.addAll(cacheURLs))
          .then(() => self.skipWaiting())
  )
});

self.addEventListener('activate', event => {
  // console.log("[Service Worker] At Activate Event", event);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if(cacheName !== staticCacheName) {
            return caches.delete(cacheName);
          }
        })
      )
    })
  );
  return self.clients.claim();
});




self.addEventListener('fetch', event => {
  // console.log("[Service Worker] fetch event in SW");
  event.respondWith(
    caches.match(event.request)
          .then(response => {
            if(response) {
              // console.log('The event.request was found in the cache');
              return response;
            }
            return fetch(event.request).then(networkResponse => {
              if(networkResponse === 404) return;
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


// From Jake Archibald Wittr demo
// https://github.com/jakearchibald/wittr
self.addEventListener('message', event => {
  console.log(event);
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});


self.addEventListener('sync', event => {
  if (event.tag == 'oneTimeSync') {
    
    // Open Database
    const idbOpenDB = indexedDB.open('restaurant-database', 3);
    
    idbOpenDB.onsuccess = function (e) {
  
      // Do something with request.result => resource from:
      // https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
      // The result is the opened restaurant-database -- assign to db
      db = idbOpenDB.result;
  
      // Get reviews from the offline-reviews store and store it in a var
      const tx = db.transaction('offline-reviews', 'readwrite');
      let store = tx.objectStore('offline-reviews');
      let offlineStore = store.getAll();
      
      // Post the offline reviews using POST Endpoint:
      // Create a new restaurant review ==> http://localhost:1337/reviews/
      offlineStore.onsuccess =  () => {
        for (let i = 0; i < offlineStore.result.length; i++) {
          fetch(`http://localhost:1337/reviews/`, {
            body: JSON.stringify(offlineStore.result[i]),
            method: 'POST',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
              'content-type': 'application/json'
            },
            mode: 'cors',
            redirect: 'follow',
            referrer: 'no-referrer'
          })
            .then(response => {
              return response.json();
            })
            .then(data => {
              // On Success of offlineStore we get the data and we add it to the reviews store
              const tx = db.transaction('reviews', 'readwrite');
              let store = tx.objectStore('reviews');
              let reviewsStore = store.add(data);
              
              
              // On Success of adding the data to the reviews store,
              // ... we no longer need the data in offline-reviews stpre, so we clear it
              reviewsStore.onsuccess = data => {
                const tx = db.transaction('offline-reviews', 'readwrite');
                let store = tx.objectStore('offline-reviews');
                let offline_store = store.clear();
                
                // On Success of clearing the data in the offline_store, we watch for errors
                offline_store.onsuccess =  () => {};
                offline_store.onerror = error => {
                  console.log('[SW-sync] - We cannot clear the offline-reviews data in the offline_store: ', error);
                }
              };
              
              // If there is an error in opening the reviews store and clearing
              // the offline-reviews data, we log the error
              reviewsStore.onerror = error => {
                console.log('[SW-sync] - We could not clear the offline-reviews data: ', error);
              }
            })
            .catch(error => {
              console.log('[SW-sync] - POST fetch failed: ', error);
            })
        } // end for loop
      }
      offlineStore.onerror = error => {
        console.log('[SW-sync] - offlineStore failed: ', error);
      }
    }
    
    
    idbOpenDB.onerror = error => {
      console.log('[SW-sync] - idbOpenDB failed: ', error);
    }
  }     // end if statement
  
});





