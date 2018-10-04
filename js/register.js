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

function networkEnabled() {
  console.log('[register.js] - Testing Network Enable');
  DBHelper.offlineReviewSubmission();
}

function networkDisabled() {
  console.log('[register.js] - Testing Network Disable');
}

window.addEventListener('online', networkEnabled);
window.addEventListener('offline', networkDisabled);
