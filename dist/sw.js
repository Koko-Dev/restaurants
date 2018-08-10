var staticCacheName="restaurants-93";self.addEventListener("install",e=>{e.waitUntil(caches.open(staticCacheName).then(e=>e.addAll(["/","index.html","js/main.js","css/styles2.css","restaurant.html","js/dbhelper.js","js/idb.js","restaurant_info.js","img/1.jpg","img/2.jpg","img/3.jpg","img/4.jpg","img/5.jpg","img/6.jpg","img/7.jpg","img/8.jpg","img/9.jpg","img/10.jpg"]).catch(e=>{console.log("Cache addAll from sw.js failed",e)})))}),self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(e=>Promise.all(e.filter(e=>e.startsWith("restaurants-")&&e!=staticCacheName).map(e=>caches.delete(e)))))}),self.addEventListener("fetch",e=>{e.respondWith(fetch(e.request).then(t=>caches.open(staticCacheName).then(s=>(s.put(e.request,response.clone()),t)).catch(t=>(console.log("[Service Worker]: Error in in fetch event"),caches.match(e.request)))))});