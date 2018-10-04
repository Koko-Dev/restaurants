/*
if('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', {scope: "/"})
    .then(reg => {
      console.log("Service worker registration successful." + reg.scope);
    })
    .catch(error => {
      console.log("Registration failed: " + error);
    })
}

/!*navigator.serviceWorker.ready.then(function(swRegistration) {
  return swRegistration.sync.register('myFirstSync');
  
})*!/

function registerOneTimeSync() {
  if(navigator.serviceWorker.controller){
    navigator.serviceWorker.ready.then(function(reg) {
      if(reg.sync){
        reg.sync.register('oneTimeSync')
          .then(function(event) {
            console.log('Sync registration successful', event);
        })
          .catch(function(error) {
            console.log('Sync registration failed', error);
        });
    } else {
        console.log('One time Sync not supported');
      }
      
  })
  } else {
    console.log('No active Service Worker');
  }
  
}*/

// Service Worker registration from Jake Archibald's Wittr demo -- indexController.js
// https://github.com/jakearchibald/wittr
navigator.serviceWorker.register('./sw.js', {scope: '/'}).then(reg =>  {
  console.log("Service worker registration successful." + reg.scope);
  
  if (!navigator.serviceWorker.controller) {
    return;
  }
  
  if (reg.waiting) {
    navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
  }
  
  if (reg.installing) {
    navigator.serviceWorker.addEventListener('statechange', () => {
      if (navigator.serviceWorker.controller.state == 'installed') {
        navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
      }
    });
  }
  
  reg.addEventListener('updatefound',  () => {
    navigator.serviceWorker.addEventListener('statechange',  () => {
      if (navigator.serviceWorker.controller.state == 'installed') {
        navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
      }
    });
  });
  
}).catch(error => {
  console.log("Registration failed: " + error);
});



let refreshNetwork;
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (refreshNetwork) return;
  window.location.reload();
  refreshNetwork = true;
})

// Register a one-time BackgroundSync 
navigator.serviceWorker.ready.then(swRegistration => {
  return swRegistration.sync.register('oneTimeSync');
});

// When the user is online or connectivity is restored,
//    submit any user reviews that were posted while the user was offline
// https://medium.com/@MateMarschalko/online-and-offline-events-with-javascript-d424bec8f43
window.addEventListener('online', event => {
  console.log('You are now back online!');
  
  // Check to see if User posted any offline reviews by checking offline-review store
  DBHelper.offlineReviewSubmission();
});

window.addEventListener('offline', event => {
  console.log('Lost connection but user can still post a review with confidence!');
});

