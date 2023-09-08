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
    // Note: API key here also, so also to be replaced with {{api_key}} or something to that effect
    credentials: 'AtvPs6MapVPoDsVJuR553m4c6noTwgPBT5l9jeXamUxY9hHqD-XgFtCq2HMBQbYA',
    center: new Microsoft.Maps.Location(42.899319, -88.989220),  // TODO - SR ancestral home  (remove this comment)
    mapTypeId: Microsoft.Maps.MapTypeId.road,
    zoom: 15
  });
  setPin()
  //Add your post map load code here.

}


const theButton = document.querySelector("#doitButton");
const pinButton = document.querySelector("#setPinButton");
console.log('buttons set');

// setTimeout(doAfterTimeout, 5000);

theButton.addEventListener("click", setMapFromLatLon);
pinButton.addEventListener("click", setPin);

console.log('listener activated');

// function doAfterTimeout() {
//     map.setView({
//         mapTypeId: Microsoft.Maps.MapTypeId.aerial,
//         center: new Microsoft.Maps.Location(35.027222, -111.0225),
//         zoom: 15
//     });
// }

function setMapFromLatLon() {
  console.log('button was pressed');
  console.log('setting new view from inputs');
  const lat = document.querySelector("#lat").value;
  const lon = document.querySelector("#lon").value;
  let zoomVar = document.querySelector("#zoom");
  let zoom = 12;
  if (zoomVar !== null) {
    zoom = zoomVar.value;
  }
  console.log('lat,loN=(', lat, ',', lon, ')');
  console.log('zoom = ', zoom)
  map.setView({
    mapTypeId: Microsoft.Maps.MapTypeId.road,
    center: new Microsoft.Maps.Location(lat, lon),
    zoom: parseInt(zoom)
  });
}

async function setPin() {
  const response = await fetch('/api/locations');
  let data = await response.json()
  console.log(data)
  console.log('PIN button was pressed');

  console.log(data)
  const pinlat = data[0].lat;
  const pinlon = data[0].lon;
  console.log(pinlat, pinlon);
  const pinLoc = new Microsoft.Maps.Location(pinlat, pinlon);
  const pin = new Microsoft.Maps.Pushpin(
    pinLoc,
    {
      title: 'pin title',
      subTitle: 'pin subtitle',
      text: 'pin text'
    });
  map.entities.push(pin);
}




console.log("hello")