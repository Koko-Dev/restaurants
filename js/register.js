if('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', {scope: "/"})
    .then(reg => {
      console.log("Service worker registration successful." + reg.scope);
    })
    .catch(error => {
      console.log("Registration failed: " + error);
    })
}

/*navigator.serviceWorker.ready.then(function(swRegistration) {
  return swRegistration.sync.register('myFirstSync');
  
})*/

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
  
}