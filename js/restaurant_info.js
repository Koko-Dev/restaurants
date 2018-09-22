let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      DBHelper.fetchReviews(self.restaurant, (error, reviews) => {
        self.restaurant.reviews = reviews;
        if(!reviews) {
          console.error(error);
        }
        fillReviewsHTML();
        callback(null, restaurant)
      });
      /*fillRestaurantHTML();
      callback(null, restaurant)*/
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  
  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  
  const image = document.getElementById('restaurant-img');
  let imgUrl = `${restaurant.id}.jpg`;
  image.className = 'restaurant-img';
  image.src = `/img/1x-banner-${imgUrl}`;
  image.srcset = `/img/1x-banner-${imgUrl} 300w, /img/2x-banner-${imgUrl} 600w, /img/3x-banner-${imgUrl} 800w`;
  image.sizes = "(max-width: 300px), (min-width: 600px), (min-width: 800px)";
  
  image.setAttribute('alt',`An image of ${restaurant.name} restaurant in ${restaurant.neighborhood}`);
  
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  
  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  
  // fill reviews
  fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    
    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);
    
    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);
    
    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);
  
  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    noReviews.setAttribute('tabindex', 0);
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);
  
  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);
  
  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);
  
  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);
  
  return li;
}

// Add a event listener for a review submission
let form = document.getElementById('reviewForm');

form.addEventListener('submit', event => {
  event.preventDefault();
  let review = {'restaurant_id': self.restaurant.id};
  const formData = new FormData(form);
  
  for(let [k, v] of formData.entries()) {
    review[k] = v;
  }
  DBHelper.reviewFormSubmission(review)
    .then(data => {
      let ul = document.querySelector('#reviews-list');
      ul.appendChild(createReviewHTML(review));
      form.reset();
    })
    .catch(error => {
      console.error(error);
    })
});

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  const aTag = document.createElement('a');
  aTag.href = window.location;
  aTag.setAttribute('aria-current', 'page');
  li.innerHTML = restaurant.name;
  li.appendChild(aTag);
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

