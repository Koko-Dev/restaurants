if (typeof idb === "undefined") {
  // self.importScripts('js/idb-bundle.min.js');
  self.importScripts('js/idb.js');
}

// Restaurant Database Name
const dbName = 'restaurant-database';

// Name of restaurant-database restaurants object store
const dbObjectStore = 'restaurants';

// Nave of restaurant-database reviews object store
const reviewsObjectStore = 'reviews';

/**
 * Common database helper functions.
 */
class DBHelper {
  
  /**
   * Database URL.
   **/
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/`;
  }
  
  /**
   * open cache
   **/
  static get openIDB() {
    // Does the Browser Support the Service Worker?
    if(!navigator.serviceWorker) return Promise.resolve();
    
    // Does the Browser Support indexedDB?
    if(!self.indexedDB) {
      reject("indexedDB is not supported by this Browser");
    }
    
    // Create a Database for the Restaurants and Reviews
    const dbPromise = idb.open(dbName, 3, (upgradeDb) => {
      // create object store
      switch (upgradeDb.oldVersion) {
        case 0:
        // Placeholder
        case 1:
          upgradeDb.createObjectStore(dbObjectStore, {keyPath: 'id'});
        case 2:
          const reviewsStore = upgradeDb.createObjectStore(reviewsObjectStore, {keyPath: 'id'});
          reviewsStore.createIndex('restaurant', 'restaurant_id');
        case 3:
          upgradeDb.createObjectStore('offline-reviews', {keyPath: 'updatedAt'})
      }
    });
    return dbPromise;
  }
  
  /**
   * Fetch and cache all restaurants.
   */
  static fetchRestaurants(callback) {
    fetch(this.DATABASE_URL + 'restaurants')
      .then(response => response.json())
      .then(restaurants => {
        this.openIDB
            .then( db => {
              const tx = db.transaction(dbObjectStore, 'readwrite');
              const restaurantStore = tx.objectStore(dbObjectStore);
              restaurants.forEach( restaurant => {
                restaurantStore.put(restaurant);
              });
              callback(null, restaurants);
              return tx.complete;
            });
      })
      .catch((error) => {
        console.log(`Request failed: ${error}`);
        callback(error, null);
      });
  }
  
  
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }
  
  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }
  
  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }
  
  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }
  
  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }
  
  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }
  
  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }
  
  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.id}`);
  }
  
  
  // Get all reviews for a restaurant first from indexedDB and then from Network GET Endpoint:
  //     http://localhost:1337/reviews/?restaurant_id=<restaurant_id>
  static fetchReviews(restaurant, callback) {
    console.log('In fetchReviews but before openIDB');
    DBHelper.openIDB
      .then(db => {
        if(!db) return;
        console.log('Reached inside fetchReviews');
        
        // First check to see if there are reviews in indexedDB
        const tx = db.transaction('reviews', 'readwrite');
        let store = tx.objectStore('reviews');
        store.getAll().then(reviewsInIDB => {
          if(reviewsInIDB && reviewsInIDB.length > 0) {
            console.log('There are reviews in indexedDb')
            // There are reviews in IndexedDB and we should use those
            callback(null, reviewsInIDB);
        } else {
            // There are no reviews in IndexedDB, so we will fetch with Endpoint
            fetch(`${DBHelper.DATABASE_URL}reviews/!restaurant_id=${restaurant.id}`)
              .then(response => {
                return response.json();
              })
              .then(reviewsFromNetwork => {
                console.log('There are reviews from the network', reviewsFromNetwork);
                this.openIDB.then(db => {
                  if(!db) return;
                  
                  // Put Reviews from Network into IndexedDB
                  const tx = db.transaction('reviews', 'readwrite');
                  let store = tx.objectStore('reviews');
                  reviewsFromNetwork.forEach(review => {
                    store.put(review);
                  })
                })
                callback(null,  reviewsFromNetwork)
              })
              .catch(error => {
                // There is an error in fetching reviews from the network
                callback(error,  null);
              })
              
              
          }
        })
      })
  }
 
  
  
  /**
   * Map marker for a restaurant.
   */
  /*static mapMarkerForRestaurant(restaurant, map) {
   // https://leafletjs.com/reference-1.3.0.html#marker
   const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
   {title: restaurant.name,
   alt: restaurant.name,
   url: DBHelper.urlForRestaurant(restaurant)
   })
   marker.addTo(newMap);
   return marker;
   }*/
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }
  
  // Updating is_favorite status based on user choice of favorite/unfavorite
  // PUT Endpoints to Favorite or Unfavorite a restaurant
  // Favorite a restaurant== http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=true
  // Unfavorite a restaurant== http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=false
  // This will store User choice if favorite or unfavorite in indexedDB for offline-first capability
  static favoriteStatusUpdate(restaurantID, favorite_status) {
    
    const url = `http://localhost:1337/restaurants/${restaurantID}/?is_favorite=${favorite_status}`;
    let headers = new Headers();
    headers.set('Accept', 'application/json');
    
    fetch(url, {
      method: 'PUT',
      headers
    })
      .then(() => {
        this.openIDB
            .then(db => {
              const tx = db.transaction('restaurants', 'readwrite');
              const store = tx.objectStore('restaurants');
              store.get(restaurantID).then(restaurant => {
                restaurant.is_favorite = favorite_status.toString();
                store.put(restaurant);
              })
            })
      })
  }
} //  end DBHelper

self.DBHelper = DBHelper;