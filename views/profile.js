let locationsArr;

// The 'map' variable must be globally accessible so that map instantiated by the GetMap callback function
// (specified in the bing URL) can subsequent be accessed by repeated calls to the setPins() function.
let map = null;

const newFormHandler = async (event) => {
  event.preventDefault();

  const city = document.querySelector('#location-name').value.trim();

  const cityInfoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=ae43fce93221a7479e25011f753d1c95`)
  .then((response) => {
    console.log(response)

    return response.json()
  })
  .then(async (cityData) => {
       
      const response = await fetch(`/api/locations`, {
      method: 'POST',
      body: JSON.stringify({ city, state: cityData[0].state, lat: cityData[0].lat, lon: cityData[0].lon  }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      document.location.replace('/profile');

    } else {
      alert('Failed to save location');
    }
  })
}



const delButtonHandler = async (event) => {
  if (event.target.hasAttribute('data-id')) {
    const id = event.target.getAttribute('data-id');

    const response = await fetch(`/api/locations/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      document.location.replace('/profile');
    } else {
      alert('Failed to delete location');
    }
  }
};

const addLocationBtn = async () => {
  const response = await fetch('/profile', {
    method: 'GET'
  });
  if (response.ok) {
    document.location.replace('/profile');
  } else {
    alert(response.statusText);
  }
};
// document.querySelector('#addLocation').addEventListener('click', addLocationBtn);

document
  .querySelector('.new-location-form')
  .addEventListener('submit', newFormHandler);

document
  .querySelector('.location-list')
  .addEventListener('click', delButtonHandler);





const fetchLocations = async () => {
  const response = await fetch('/api/locations');
  let data = await response.json()

  return data
};

function GetMap() {
  // CAREFUL!:  This file is NOT returned to the requesting client unaltered when a get is 
  // sent to the /js/profile.js URL path.  Rather, the server will dynamically alter the
  // contents of this file, replacing the reference to BING_API_KEY below with the actual
  // API key.  In all other respects, though, the returned file is unaltered.
  map = new Microsoft.Maps.Map('#myMap', {
    credentials: 'BING_API_KEY',  // note replacement of this content by /js/profile.js route
    mapTypeId: Microsoft.Maps.MapTypeId.road,
    zoom: 12
  });
  setPins()
}

function centerMapFromLatLon(ctrLatitude, ctrLongitude, zoom) {
  // Center the map at the provided coordinates and adjust the 
  // magnification based on the zoom factor after first insuring
  // the zoom factor is within the acceptable range.
  zoom = Math.max(1, zoom);
  zoom = Math.min(20, zoom);
  map.setView({
    mapTypeId: Microsoft.Maps.MapTypeId.road,
    center: new Microsoft.Maps.Location(ctrLatitude, ctrLongitude),
    zoom: parseInt(zoom)
  });
}

const pinDarkRed = '#B52318'
const pinBrightRed = '#DF2A25';

const svgPin = 
`<svg version="1.1"
width="40" height="50"
xmlns="http://www.w3.org/2000/svg">
<circle cx="18" cy="17" r="15" fill="${pinDarkRed}" />
<circle cx="18" cy="42" r="3" fill="${pinDarkRed}" />
<polygon points="6 26 15.6 43.8 20.4 40.2 10.8 22.4" fill="${pinDarkRed}" />
<polygon points="18 45 22 45 20 40" fill="${pinDarkRed}" />
<circle cx="22" cy="17" r="15" fill="${pinBrightRed}" />
<circle cx="22" cy="42" r="3" fill="${pinBrightRed}" />
<polygon points="10 26 19.6 43.8 24.4 43.8 34 26" fill="${pinBrightRed}" />
<circle cx="22" cy="17" r="7.5" fill="#FFFFFF" />
</svg>`;

async function setPins() {
  // Fetch the array of locations associated with the current logged-in 
  // user, converting from JSON to an array of Location objects
  const response = await fetch('/api/locations');
  let data = await response.json()
  let minLat = 90;
  let maxLat = -90;
  let minLon = 180;
  let maxLon = -180;
  // For each of the user's Location objects (corresponding to a pin)...
  for (let i = 0; i < data.length; i++) {
    // Latitude and longitude data are stored in the database as strings and, therefore, 
    // cannot be certain to be numeric and in an appropriate range for coordinates, we
    // attempt to convert these two numerics first and then only plot pins for those 
    // whose numeric values are appropriate for latitudes (-90 to 90) and longitudes 
    // (-180 to 180).
    //
    // Convert to numeric from string
    const pinLat = parseFloat(data[i].lat);
    const pinLon = parseFloat(data[i].lon);
    if (isNaN(pinLat) || isNaN(pinLon)) {
      // Reject and log coordinates that are not numeric.  Note that typeof pinLat or pinLon
      // might still be number, but the value could be NaN (not a number) and so this has to
      // be tested explicitly.  
      console.log('data at ', i, ' is not numeric ("', data[i].lat, '","', data[i].lon, '")');
    } else if (pinLat < -90 || pinLat > 90 || pinLon < -180 || pinLon > 180) {
      // Once it is determined the values are numeric, we still have to verify that the values
      // are in an appropriate range for geographic coordinates.  If not then we reject and
      // console log the values.
      console.log('coords invalid at ', i, ' = (', pinLat, ',', pinLon, ')');
    } else {
      // If we get to this point in processing then the latitude and longitude are valid
      // and we proceed with the necessary processing to place a pin on the map.
      // At the same time, while looping through all data points, we record the minimum
      // and maximum latitudes and longitudes, as it is those extremes which will determine
      // the framing of the map.
      if (pinLat < minLat) {
        minLat = pinLat;
      }
      if (pinLat > maxLat) {
        maxLat = pinLat;
      }
      if (pinLon < minLon) {
        minLon = pinLon;
      }
      if (pinLon > maxLon) {
        maxLon = pinLon;
      }
      // If the state field is invalid or empty then we construct the pin title
      // from the city name alone.  Otherwise, we append a comma and the state
      // as well in the pin title.
      let title = data[i].city;
      if (data[i].state && data[i].state.trim() !== '') {
        title += (', ' + data[i].state.trim());
      }
      // Note that the pin is first created and only then appended to the
      // map.  
      const pinLoc = new Microsoft.Maps.Location(pinLat, pinLon);
      const pin = new Microsoft.Maps.Pushpin(
        pinLoc,
        {
          title: title,
          // Pins can have 'title', 'subtitle', and 'text' fields.  'title' and 'subtitle'
          // both appear beside the pin, whereas 'text' goes ON the pin.  For now, we only
          // want 'title', but noting here that we have the option of these other fields.
          //
          // subTitle: 'pin subtitle',
          // text: 'pin text'
          //
          // color: (data[i].visited ? '#ff0000' : '#0080ff')
          //node
          // For now, we just use red for all pins; however, the above line of code would enable color
          // coding of the pins as either red or blue depending on the state of the data[].visited field.
          // color: '#ff0000',
          // icon: '/img/pushpin.svg',
          icon: svgPin,
          anchor: new Microsoft.Maps.Point(21, 45)
        });
      // Attach newly created pin to the map.
      map.entities.push(pin);
    }
  }
  // Now that we have examined all pin data and placed all pins, we know the minimum and maximum values
  // for both latitude and longitude.  With those we now calculate the coordinates of the center of
  // the map.
  const ctrLat = (minLat + maxLat) / 2;
  const ctrLon = (minLon + maxLon) / 2;
  // Now we calculate 'range' which is *approximately* the number of degrees spanned by the various
  // pins.  This is needed in order to calculate the zoom factor for the map.
  //
  // latRange = span of latitudes in degrees - a simple subtraction of maximum and minimum
  const latRange = maxLat - minLat;
  // lonRange = the *adjusted* span in longitude of all the points.  Since longitude lines are
  //            closer together at higher latitudes, the difference in longitudes is then adjusted
  //            by multiplying by the cosine of the average latitude (i.e. shrinking the difference 
  //            more the farther we are from the equator).  Not that Math.cos() expects radians as
  //            input rather than degrees, so we first multiply ctrLat by PI/180 to convert that
  //            value from degrees to radians.
  const lonRange = (maxLon - minLon) * Math.cos(Math.PI / 180 * ctrLat);
  const range = Math.max(latRange, lonRange);
  // The zoom index used to set the scale of the map.  Acceptable values are 1 through 20 and should be
  // integers.  The smallest value, 1, indicates a scale sufficient to map the entire globe and 20 
  // indicates the smallest possible scale - very roughly 30cm per pixel.
  // We use the 'range' value calculated above to come up with a zoom value.  Each increment in the
  // zoom index represents an exponential difference in magnification, so logarithms (Math.log()) are used
  // to determine an *approximation* of the correct value for displaying all the pins in the map.
  // The result of this calculation will likely not be an integer, so we must also round to make it an
  // integer.  Finally, we use max and min to insure the final result in in the allowed range of 1 to 20.
  let zoomEst = 12;  // default - approximately city-level zoom
  if (range > 0) {
    zoomEst = Math.log(Math.cos(ctrLat * Math.PI / 180) * 156543.04 * Math.min(600, 400) * 90 / 1E7 / range) / Math.log(2) - 1;
    zoomEst = Math.round(zoomEst);
    zoomEst = Math.max(1, zoomEst);
    zoomEst = Math.min(20, zoomEst);
  }
  // Now we have the three parameters necessary to reposition the map - the coordinates of its center
  // and the zoom factor.  Calling centerMapFromLatLon will cause the pre-existing map object to be
  // recentered and repositioned accordingly.
  centerMapFromLatLon(ctrLat, ctrLon, zoomEst);
}
