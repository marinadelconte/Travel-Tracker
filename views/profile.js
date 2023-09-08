let locationsArr;
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

// document
//   .querySelector('.location-list')
//   .addEventListener('click', delButtonHandler);





const fetchLocations = async () => {
  const response = await fetch('/api/locations');
  let data = await response.json()

  return data
};

function GetMap() {
  console.log("get map function")
  map = new Microsoft.Maps.Map('#myMap', {
    credentials: 'BING_API_KEY',  // note replacement of this content by /js/profile.js route
    center: new Microsoft.Maps.Location(42.899319, -88.989220),  // TODO - SR ancestral home  (remove this comment)
    mapTypeId: Microsoft.Maps.MapTypeId.road,
    zoom: 15
  });
  setPins()
  //Add your post map load code here.

}


const theButton = document.querySelector("#doitButton");
const pinButton = document.querySelector("#setPinButton");
console.log('buttons set');

// setTimeout(doAfterTimeout, 5000);

theButton.addEventListener("click", centerMapFromLatLon(37.681771,-95.451805, 4));
pinButton.addEventListener("click", setPins);

console.log('listener activated');

// function doAfterTimeout() {
//     map.setView({
//         mapTypeId: Microsoft.Maps.MapTypeId.aerial,
//         center: new Microsoft.Maps.Location(35.027222, -111.0225),
//         zoom: 15
//     });
// }

function centerMapFromLatLon(ctrLatitude, ctrLongitude, zoom) {
  zoom = Math.max(1, zoom);
  zoom = Math.min(20, zoom);
  map.setView({
    mapTypeId: Microsoft.Maps.MapTypeId.road,
    center: new Microsoft.Maps.Location(ctrLatitude, ctrLongitude),
    zoom: parseInt(zoom)
  });
}

async function setPins() {
  const response = await fetch('/api/locations');
  console.log('setPins() response = ', response);
  let data = await response.json()
  console.log('\x1b[33msetPins() data = ', data, ' \x1b[0m');
  // console.log('PIN button was pressed');
  // console.log(data)
  let minLat = 90;
  let maxLat = -90;
  let minLon = 180;
  let maxLon = -180;
  for (let i = 0; i < data.length; i++) {
    const pinLat = parseFloat(data[i].lat);
    const pinLon = parseFloat(data[i].lon);
    if (isNaN(pinLat) || isNaN(pinLon)) {
      console.log('data at ', i, ' is not numeric ("', data[i].lat, '","', data[i].lon, '")');
    } else if (pinLat < -90 || pinLat > 90 || pinLon < -180 || pinLon > 180) {
      console.log('is this working?');
      console.log('coords invalid at ', i, ' = (', pinLat, ',', pinLon, ')');
    } else {
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
      console.log('\x1b[33msetPins() [', i, '] pinLat, pinLon = (', pinLat, ', ', pinLon, ')\x1b[0m');
      let title = data[i].city;
      if (data[i].state && data[i].state.trim() !== '') {
        title += (', ' + data[i].state.trim());
      }
      const pinLoc = new Microsoft.Maps.Location(pinLat, pinLon);
      const pin = new Microsoft.Maps.Pushpin(
        pinLoc,
        {
          title: title,
          // subTitle: 'pin subtitle',
          // text: 'pin text'
          color: (data[i].visited ? '#ff0000' : '#0080ff')
        });
      map.entities.push(pin);
    }
  }
  console.log('pin lat range = ', minLat, ' -> ', maxLat);
  console.log('pin lon range = ', minLon, ' -> ', maxLon);
  console.log('coord type : ', typeof minLat, ' ', typeof maxLat, ' ', typeof minLon, ' ', typeof maxLon);
  const ctrLat = (minLat + maxLat) / 2;
  const ctrLon = (minLon + maxLon) / 2;
  console.log('map to be re-centered at : ', ctrLat, ', ', ctrLon);
  const latRange = Math.abs(maxLat - minLat);
  const lonRange = Math.abs(maxLon - minLon) * Math.cos(Math.PI / 180 * ctrLat);
  const range = Math.max(latRange, lonRange);
  console.log('range = ', range);
  let zoomEst = 12;
  if (range > 0) {
    console.log('log e = ', Math.log(2.718));
    console.log('old zoom = ', 5 - 0.58 * Math.log(range));
    zoomEst = Math.log(Math.cos(ctrLat * Math.PI / 180) * 156543.04 * Math.min(600, 400) * 90 / 1E7 / range) / Math.log(2) - 1;
    console.log('zoom 1 : ', zoomEst);
    zoomEst = Math.round(zoomEst);
    console.log('zoom 2 : ', zoomEst);
    zoomEst = Math.max(1, zoomEst);
    console.log('zoom 3 : ', zoomEst);
    zoomEst = Math.min(20, zoomEst);
    console.log('zoom 4 : ', zoomEst);
  }
  console.log('zoom = ', zoomEst);
  centerMapFromLatLon(ctrLat, ctrLon, zoomEst);

}
