const fs = require('fs');
const path = require('path');
const floc = path.join(__dirname, '..', 'seeds', 'cities.txt');
const flocOut = path.join(__dirname, '..', 'seeds', 'cities.json');

const reformatCities = async () => {
    console.log('floc = "' + floc + '"');
    fs.readFile(floc, 'utf8', async (err, data) => {
        if (err) {
            console.log('err reading file = ', JSON.stringify(err));
        } else {
            console.log('file successfully read : \n\n', data, '\n\n');
            const cities = data.split(/\r?\n|\r|\n/g);
            console.log('cities entry count = ', cities.length);
            let citiesOut = [];
            for (let i = 0; i < cities.length; i++) {
                let city = cities[i].trim();
                if (city.length < 1) {
                    console.log('no city at index ', i);
                } else {
                    // console.log('  city[', i, '] = "', city, '"');
                    let code = city.charCodeAt(city.length - 1);
                    // console.log('last char code = ', code, '  len = ', city.length);
                    const cityInfoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=ae43fce93221a7479e25011f753d1c95`);
                    const cityJson = await cityInfoResponse.json();
                    if (cityJson.length < 1) {
                        console.log('no results for ' + city);
                    } else {
                        let { name, lat, lon, state } = cityJson[0];
                        if (name && lat && lon && state) {
                            const obj = {
                                user_id: 5,
                                city: name,
                                state: state,
                                visited: true,
                                lat: lat,
                                lon: lon
                            };
                            // console.log('appending = ', JSON.stringify(obj));
                            citiesOut.push(obj);
                            // console.log('append = ' + citiesOut.length);
                        } else {
                            console.log('failed destructure on ' + i);
                        }
                    }
                }
            }
            console.log('cities out len = ', citiesOut.length);
            const outputJson = JSON.stringify(citiesOut, null, 2);
            // console.log('\x1b[33moutput = \n', outputJson, '\x1b[0m');
            fs.writeFile(flocOut, outputJson, 'utf8', (err) => {
                if (err) {
                    console.log('error on write = ', JSON.stringify(err));
                }
            })
        }
    });
}

reformatCities();