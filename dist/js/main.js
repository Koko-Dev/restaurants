let restaurants,neighborhoods,cuisines;var map,markers=[];"serviceWorker"in navigator&&(navigator.serviceWorker.register("/sw.js"),console.log("From main.js:  service worker is registered")),document.addEventListener("DOMContentLoaded",e=>{fetchNeighborhoods(),fetchCuisines()}),fetchNeighborhoods=(()=>{DBHelper.fetchNeighborhoods((e,t)=>{e?console.error(e):(self.neighborhoods=t,fillNeighborhoodsHTML())})}),fillNeighborhoodsHTML=((e=self.neighborhoods)=>{const t=document.getElementById("neighborhoods-select");e.forEach(e=>{const n=document.createElement("option");n.innerHTML=e,n.value=e,t.append(n)})}),fetchCuisines=(()=>{DBHelper.fetchCuisines((e,t)=>{e?console.error(e):(self.cuisines=t,fillCuisinesHTML())})}),fillCuisinesHTML=((e=self.cuisines)=>{const t=document.getElementById("cuisines-select");e.forEach(e=>{const n=document.createElement("option");n.innerHTML=e,n.value=e,t.append(n)})}),window.initMap=(()=>{self.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),updateRestaurants()}),updateRestaurants=(()=>{const e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select"),n=e.selectedIndex,s=t.selectedIndex,r=e[n].value,o=t[s].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(r,o,(e,t)=>{e?console.error(e):(resetRestaurants(t),fillRestaurantsHTML())})}),resetRestaurants=(e=>{self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers.forEach(e=>e.setMap(null)),self.markers=[],self.restaurants=e}),fillRestaurantsHTML=((e=self.restaurants)=>{const t=document.getElementById("restaurants-list");e.forEach(e=>{t.append(createRestaurantHTML(e))}),addMarkersToMap()}),createRestaurantHTML=(e=>{const t=document.createElement("li");let n=`${e.photograph}.jpg`;const s=document.createElement("img");s.className="restaurant-img",s.src=DBHelper.imageUrlForRestaurant(e),s.srcset=`/img/1x-${n} 300w, /img/2x-${n} 600w`,s.sizes="(max-width: 300px), (min-width: 600px)",s.setAttribute("alt",`An image of ${e.description} in ${e.name}'s restaurant`),t.append(s);const r=document.createElement("div");t.append(r);const o=document.createElement("h2");o.innerHTML=e.name,t.append(o);const a=document.createElement("p");a.innerHTML=e.neighborhood,t.append(a);const i=document.createElement("p");i.innerHTML=e.address,t.append(i);const l=document.createElement("button");return l.innerHTML="View Details",l.onclick=(()=>{const t=DBHelper.urlForRestaurant(e);window.location=t}),l.style.color="#fff",l.style.backgroundColor="#bf780d",l.style.padding="10px 15px 10px 15px",l.style.fontSize="1.5em",l.style.marginTop="1em",l.style.borderRadius="10px",t.append(l),t}),addMarkersToMap=((e=self.restaurants)=>{e.forEach(e=>{const t=DBHelper.mapMarkerForRestaurant(e,self.map);google.maps.event.addListener(t,"click",()=>{window.location.href=t.url}),self.markers.push(t)})});