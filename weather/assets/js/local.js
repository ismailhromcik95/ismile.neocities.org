document.addEventListener('DOMContentLoaded', function() {

  const countryNameToCode = {
    "Afghanistan": "AF", "Albania": "AL", "Algeria": "DZ", "Andorra": "AD", "Angola": "AO",
    "Antigua and Barbuda": "AG", "Argentina": "AR", "Armenia": "AM", "Australia": "AU",
    "Austria": "AT", "Azerbaijan": "AZ", "Bahamas": "BS", "Bahrain": "BH", "Bangladesh": "BD",
    "Barbados": "BB", "Belarus": "BY", "Belgium": "BE", "Belize": "BZ", "Benin": "BJ",
    "Bhutan": "BT", "Bolivia": "BO", "Bosnia and Herzegovina": "BA", "Botswana": "BW",
    "Brazil": "BR", "Brunei": "BN", "Bulgaria": "BG", "Burkina Faso": "BF", "Burundi": "BI",
    "Cabo Verde": "CV", "Cambodia": "KH", "Cameroon": "CM", "Canada": "CA", "Central African Republic": "CF",
    "Chad": "TD", "Chile": "CL", "China": "CN", "Colombia": "CO", "Comoros": "KM",
    "Congo (Congo-Brazzaville)": "CG", "Costa Rica": "CR", "Croatia": "HR", "Cuba": "CU",
    "Cyprus": "CY", "Czechia": "CZ", "Democratic Republic of the Congo": "CD",
    "Denmark": "DK", "Djibouti": "DJ", "Dominica": "DM", "Dominican Republic": "DO",
    "Ecuador": "EC", "Egypt": "EG", "El Salvador": "SV", "Equatorial Guinea": "GQ",
    "Eritrea": "ER", "Estonia": "EE", "Eswatini": "SZ", "Ethiopia": "ET", "Fiji": "FJ",
    "Finland": "FI", "France": "FR", "Gabon": "GA", "Gambia": "GM", "Georgia": "GE",
    "Germany": "DE", "Ghana": "GH", "Greece": "GR", "Grenada": "GD", "Guatemala": "GT",
    "Guinea": "GN", "Guinea-Bissau": "GW", "Guyana": "GY", "Haiti": "HT", "Honduras": "HN",
    "Hungary": "HU", "Iceland": "IS", "India": "IN", "Indonesia": "ID", "Iran": "IR",
    "Iraq": "IQ", "Ireland": "IE", "Israel": "PS", "Italy": "IT", "Jamaica": "JM",
    "Japan": "JP", "Jordan": "JO", "Kazakhstan": "KZ", "Kenya": "KE", "Kiribati": "KI", "Kosovo": "KS",
    "Kuwait": "KW", "Kyrgyzstan": "KG", "Laos": "LA", "Latvia": "LV", "Lebanon": "LB",
    "Lesotho": "LS", "Liberia": "LR", "Libya": "LY", "Liechtenstein": "LI", "Lithuania": "LT",
    "Luxembourg": "LU", "Madagascar": "MG", "Malawi": "MW", "Malaysia": "MY", "Maldives": "MV",
    "Mali": "ML", "Malta": "MT", "Marshall Islands": "MH", "Mauritania": "MR", "Mauritius": "MU",
    "Mexico": "MX", "Micronesia": "FM", "Moldova": "MD", "Monaco": "MC", "Mongolia": "MN",
    "Montenegro": "ME", "Morocco": "MA", "Mozambique": "MZ", "Myanmar": "MM", "Namibia": "NA",
    "Nauru": "NR", "Nepal": "NP", "Netherlands": "NL", "New Zealand": "NZ", "Nicaragua": "NI",
    "Niger": "NE", "Nigeria": "NG", "North Korea": "KP", "North Macedonia": "MK", "Norway": "NO",
    "Oman": "OM", "Pakistan": "PK", "Palau": "PW", "Palestine": "PS", "Palestinian Territory": "PS", "Panama": "PA",
    "Papua New Guinea": "PG", "Paraguay": "PY", "Peru": "PE", "Philippines": "PH", "Poland": "PL",
    "Portugal": "PT", "Qatar": "QA", "Romania": "RO", "Russia": "RU", "Rwanda": "RW",
    "Saint Kitts and Nevis": "KN", "Saint Lucia": "LC", "Saint Vincent and the Grenadines": "VC",
    "Samoa": "WS", "San Marino": "SM", "Sao Tome and Principe": "ST", "Saudi Arabia": "SA",
    "Senegal": "SN", "Serbia": "RS", "Seychelles": "SC", "Sierra Leone": "SL", "Singapore": "SG",
    "Slovakia": "SK", "Slovenia": "SI", "Solomon Islands": "SB", "Somalia": "SO", "South Africa": "ZA",
    "South Korea": "KR", "South Sudan": "SS", "Spain": "ES", "Sri Lanka": "LK", "Sudan": "SD",
    "Suriname": "SR", "Sweden": "SE", "Switzerland": "CH", "Syria": "SY", "Taiwan": "TW",
    "Tajikistan": "TJ", "Tanzania": "TZ", "Thailand": "TH", "Timor-Leste": "TL", "Togo": "TG",
    "Tonga": "TO", "Trinidad and Tobago": "TT", "Tunisia": "TN", "Turkey": "TR", "Turkmenistan": "TM",
    "Tuvalu": "TV", "Uganda": "UG", "Ukraine": "UA", "United Arab Emirates": "AE",
    "United Kingdom": "UK", "United States": "US", "Uruguay": "UY", "Uzbekistan": "UZ",
    "Vanuatu": "VU", "Vatican City": "VA", "Venezuela": "VE", "Vietnam": "VN", "Yemen": "YE",
    "Zambia": "ZM", "Zimbabwe": "ZW"
  };

  // Degrees to compass direction
  function degToCompass(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  }

  // Get location with manual override support
  async function getApproximateLocation() {
    // Check for manually set location first
    const manualLocation = localStorage.getItem('weatherLocation');
    if (manualLocation) {
      return JSON.parse(manualLocation);
    }

    // Check cache (valid for 1 hour)
    const cachedLocation = localStorage.getItem('ipLocation');
    const cacheTime = localStorage.getItem('ipLocationTime');
    if (cachedLocation && cacheTime && Date.now() - cacheTime < 3600000) {
      return JSON.parse(cachedLocation);
    }

    // Fallback to IP geolocation
    const ipApis = [
      'https://ipapi.co/json/',
      'https://ipwho.is/',
      'https://freeipapi.com/api/json/'
    ];

    for (const apiUrl of ipApis) {
        try {
            const response = await fetch(apiUrl, { signal: AbortSignal.timeout(2000) });
            if (!response.ok) continue;
            
            const data = await response.json();

            // Improved country code extraction
            let countryCode = "US";
            if (data.country_code) {
                countryCode = data.country_code.toUpperCase();
            } else if (data.country) {
                countryCode = countryNameToCode[data.country] || "US";
            }

            const location = {
                city: data.city || data.regionName || "New York",
                country: countryCode,
                lat: data.latitude || data.lat || 40.7128,
                lon: data.longitude || data.lon || -74.0060
            };


        // Cache the IP location
        localStorage.setItem('ipLocation', JSON.stringify(location));
        localStorage.setItem('ipLocationTime', Date.now());
        return location;
      } catch (error) {
        console.warn(`Failed with ${apiUrl}:`, error);
        continue;
      }
    }

    // All APIs failed - use default
    return {
      city: "New York",
      country: "US",
      lat: 40.7128,
      lon: -74.0060
    };
  }


  // City selection functionality
  async function selectCity(persist = false) {
      const newCity = prompt("Enter a city name (e.g., 'Paris' or 'Tokyo, Japan'):");
      if (!newCity) return;

      try {
          // Geocode using OpenStreetMap
          const response = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(newCity)}&format=json&limit=1`
          );
          if (!response.ok) throw new Error('Geocoding service unavailable');
          
          const results = await response.json();
          console.log("Geocoder raw result:", results[0]);
          if (results.length === 0) throw new Error('City not found');

          // Extract country information
          let countryCode = "US";
          let cityName = results[0].name || newCity;

          // Method 1: Check address.country_code first
          if (results[0].address && results[0].address.country_code) {
              countryCode = results[0].address.country_code.toUpperCase();
          }
          // Method 2: Parse from display_name
          else if (results[0].display_name) {
              const parts = results[0].display_name.split(', ');
              const possibleCountry = parts[parts.length - 1];
              countryCode = countryNameToCode[possibleCountry] || "US";
          }

          console.log("Final resolved countryCode:", countryCode);
          console.log("Final resolved cityName:", cityName);

          const location = {
              city: cityName,
              country: countryCode,
              lat: parseFloat(results[0].lat),
              lon: parseFloat(results[0].lon)
          };

          // Persist if requested
          if (persist) {
              localStorage.setItem('weatherLocation', JSON.stringify(location));
          } else {
              localStorage.removeItem('weatherLocation');
          }

    await displayLocation(location); // Was fetchWeatherWithLocation()
  } catch (error) {
    alert(`Couldn't find "${newCity}". Please try a different location.`);
  }
}

async function displayLocation(location) {
  try {
    const cityElement = document.querySelector('.city');
    if (cityElement) {
      // Special country name handling
      let countryDisplay;
      switch(location.country) {
        case 'PS':
          countryDisplay = 'Palestine';
          break;
        default:
          countryDisplay = location.country; // Use country code for others
      }
      
      cityElement.textContent = `${location.city}, ${countryDisplay}`;
    }
    
    await renderCityMap(location.lat, location.lon, location.city, location.country);
  } catch (error) {
    console.error("Failed to display location:", error);
    showErrorState();
  }
}

function showErrorState() {
  const cityElement = document.querySelector('.city');
  if (cityElement) cityElement.textContent = "--";
}

 // Simple SVG Map Rendering
  const countryCache = {};

  async function renderCityMap(lat, lon, cityName, countryCode) {
    const map = document.getElementById('map');
    if (!map) {
      console.error("Map element not found!");
      return;
    }

    console.log("Rendering map with:", {
      cityName,
      countryCode,
      validCode: countryCode && countryCode.length === 2
    });

    // Clear previous map
    map.innerHTML = '';

    // 1. Always render the city as a dot (default position: center)
    const cityDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    cityDot.setAttribute('cx', '50');
    cityDot.setAttribute('cy', '50');
    cityDot.setAttribute('r', '2.5');
    cityDot.setAttribute('class', 'selected-city');
    cityDot.setAttribute('title', cityName);
    map.appendChild(cityDot);

    // 2. Try to fetch country outline (only if valid ISO code)
    if (countryCode && countryCode.length === 2) {
      try {
        if (!countryCache[countryCode]) {
          countryCache[countryCode] = await fetchCountryOutline(countryCode);
        }
        const country = countryCache[countryCode];
        
        if (country) {
          console.log("Country outline loaded:", country);

          const bounds = getCountryBounds(country, countryCode);
          let scaleX = 100 / bounds.width;
          let scaleY = 100 / bounds.height;
          let scale = Math.min(scaleX, scaleY) * 0.8; // Add padding

          // Render country shape
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute('d', geoToSvgPath(country, bounds, scale, countryCode));
          path.setAttribute('class', 'country-outline');
          map.insertBefore(path, cityDot); // Ensure dot stays on top

          // Position city dot correctly
          cityDot.setAttribute('cx', (lon - bounds.centerX) * scale + 50);
          cityDot.setAttribute('cy', (bounds.centerY - lat) * scale + 50);
        }
      } catch (error) {
        console.error("Failed to render country outline:", error);
      }
    }

    // 3. Set default view (zoomed on city if country loaded, else centered)
    map.setAttribute('viewBox', '0 0 100 100');
  }

  async function fetchCountryOutline(countryCode) {
    if (!countryCode || countryCode.length !== 2) {
      console.warn('Invalid country code:', countryCode);
      return null;
    }

    try {
      const response = await fetch(`https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson`);
      const data = await response.json();



    // Special case: Palestine/Israel
    if (countryCode === 'PS' || countryCode === 'IL') {
      const israel = data.features.find(f => f.properties.NAME === 'Israel');
      const palestine = data.features.find(f => f.properties.NAME === 'Palestine');
      
      if (israel || palestine) {
        // Merge geometries (if both exist)
        return {
          type: "Feature",
          properties: { NAME: "Israel/Palestine" },
          geometry: {
            type: "GeometryCollection",
            geometries: [
              ...(israel ? [israel.geometry] : []),
              ...(palestine ? [palestine.geometry] : [])
            ]
          }
        };
      }
    }
    else if (countryCode === 'RS') {
      const serbia = data.features.find(f => f.properties.ISO_A2 === 'RS');
      const kosovo = data.features.find(f => f.properties.ISO_A2 === 'KS' || f.properties.NAME === 'Kosovo');
      
      if (serbia || kosovo) {
        return {
          type: "Feature",
          properties: { NAME: "Serbia/Kosovo" },
          geometry: {
            type: "GeometryCollection",
            geometries: [
              ...(serbia ? [serbia.geometry] : []),
              ...(kosovo ? [kosovo.geometry] : [])
            ]
          }
        };
      }
    }

      // Special handling for countries with -99 codes
      const country = data.features.find(f => {
        // Normal case
        if (f.properties.ISO_A2 === countryCode) return true;
        
        // Special cases
        if (countryCode === 'FR' && f.properties.NAME === 'France') return true;
        if (countryCode === 'KS' && f.properties.NAME === 'Kosovo') return true;
        if (countryCode === 'NO' && f.properties.NAME === 'Norway') return true;
        if (countryCode === 'PS' && f.properties.NAME === 'Israel') return true;
        if (countryCode === 'UK' && f.properties.NAME === 'United Kingdom') return true;
        return false;
      });

      if (!country) {
        console.warn('Country not found:', countryCode);
        return null;
      }
      
      console.log('Loaded country:', country.properties.NAME, {
        code: countryCode,
        ISO_A2: country.properties.ISO_A2,
        ISO_A3: country.properties.ISO_A3
      });
      
      return country;
    } catch (error) {
      console.error("Failed to load country outline:", error);
      return null;
    }
  }

  function getCountryBounds(country, countryCode) {
    // Define known problematic countries with manual bounds
    const COUNTRY_BOUNDS = {
      'AZ': { // Azerbaijan
        minLon: 44.8, maxLon: 50.9,
        minLat: 38.4, maxLat: 41.9,
        width: 6.0, height: 3.5,
        centerX: 47.5, centerY: 40.0
      },
      'CA': { // Canada - less vertical compression
        minLon: -141.0, maxLon: -52.0,
        minLat: 41.7, maxLat: 83.1,
        width: 83.0, height: 35.0,
        centerX: -96.5, centerY: 62.4
      },
      'CL': { // Chile - better centering
        minLon: -75.6, maxLon: -66.4,
        minLat: -56.0, maxLat: -17.5,
        width: 9.2, height: 36.5,
        centerX: -71.0, centerY: -36.75
      },
      'DK': { // Denmark - slightly bigger
        minLon: 8.0, maxLon: 15.0,
        minLat: 54.5, maxLat: 57.8,
        width: 6.5, height: 2.8,
        centerX: 11.8, centerY: 56.15
      },
      'EE': { // Estonia - slightly bigger
        minLon: 21.5, maxLon: 28.2,
        minLat: 57.3, maxLat: 59.7,
        width: 4.3, height: 2.0,
        centerX: 25.8, centerY: 58.5
      },
      'ES': { // Spain - expanded bounds
        minLon: -9.5, maxLon: 4.3,
        minLat: 35.8, maxLat: 43.8,
        width: 14.0, height: 8.0,
        centerX: -2.0, centerY: 40.0
      },
      'FR': { // Mainland France only
        minLon: -5.15, maxLon: 9.56,
        minLat: 41.30, maxLat: 51.10,
        width: 14.71, height: 9.8,
        centerX: 2.205, centerY: 46.20
      },
      'UK': { // UK - focus on mainland
        minLon: -8.6, maxLon: 1.8,
        minLat: 49.9, maxLat: 60.9,
        width: 9.0, height: 10.0,
        centerX: -3.4, centerY: 54.4
      },
      'GR': { // Greece - slightly bigger
        minLon: 19.0, maxLon: 29.6,
        minLat: 34.8, maxLat: 41.7,
        width: 6.0, height: 6.0,
        centerX: 23.5, centerY: 38.5
      },
      'ID': { // Indonesia (focus on main islands)
        minLon: 95.0, maxLon: 141.0,
        minLat: -11.0, maxLat: 6.0,
        width: 45.0, height: 16.0,
        centerX: 118.0, centerY: -2.0
      },
      'IS': { // Iceland
        minLon: -24.5, maxLon: -13.5,
        minLat: 63.4, maxLat: 66.5,
        width: 11.0, height: 3.1,
        centerX: -19.0, centerY: 64.95
      },
      'JP': { // Main Japanese islands
        minLon: 129.408463, maxLon: 145.543137,
        minLat: 30.987676, maxLat: 45.55749
      },
      'KS': {
        minLon: 20.0, maxLon: 21.7,
        minLat: 42.1, maxLat: 43.0,
        width: 1.7, height: 0.9,
        centerX: 20.85, centerY: 42.55
      },
      'MY': { // Malaysia (focus on West + East Malaysia)
        minLon: 99.6, maxLon: 119.3,
        minLat: 0.9, maxLat: 7.4,
        width: 20.0, height: 6.5,
        centerX: 109.0, centerY: 4.0
      },
      'NL': { // Netherlands
        minLon: 3.2, maxLon: 7.2,
        minLat: 50.8, maxLat: 53.5,
        width: 4.0, height: 2.7,
        centerX: 5.2, centerY: 52.1
      },
      'NO': { // Mainland Norway only
        minLon: 4.00, maxLon: 31.50,
        minLat: 57.90, maxLat: 71.20,
        width: 27.50, height: 13.30,
        centerX: 17.75, centerY: 64.55
      },
      'NZ': { // New Zealand (focus on North + South Islands)
        minLon: 166.0, maxLon: 179.0,
        minLat: -47.0, maxLat: -34.0,
        width: 12.0, height: 12.0,
        centerX: 172.5, centerY: -40.5
      },
      'OM': { // Oman (mainland only)
        minLon: 52.0, maxLon: 60.0,
        minLat: 16.5, maxLat: 26.5,
        width: 8.0, height: 10.0,
        centerX: 56.0, centerY: 21.0
      },
      'PH': { // Philippines
        minLon: 116.9, maxLon: 126.6,
        minLat: 4.6, maxLat: 21.2,
        width: 10.0, height: 16.0,
        centerX: 122.0, centerY: 12.0
      },
      'PS': { // Israel/Palestine
        minLon: 34.3, maxLon: 35.9,
        minLat: 29.5, maxLat: 33.3,
        width: 1.6, height: 3.8,
        centerX: 35.1, centerY: 31.4
      },
      'PT': { // Portugal - make larger
        minLon: -9.5, maxLon: -6.0,
        minLat: 36.8, maxLat: 42.2,
        width: 3.0, height: 5.0,
        centerX: -7.75, centerY: 39.5
      },
      'RS': { // Serbia (+ Kosovo)
        minLon: 18.8, maxLon: 23.0,
        minLat: 41.8, maxLat: 46.2,
        width: 4.2, height: 4.4,
        centerX: 20.9, centerY: 44.0
      },
      'RU': { // Full Russia bounds including eastern parts
        minLon: 19.6389, maxLon: 190.0,
        minLat: 41.1851, maxLat: 81.8589,
        width: 170.3611, height: 40.6738,
        centerX: 104.81945, centerY: 61.522
      },
      'TJ': { // Tajikistan
        minLon: 67.3, maxLon: 75.2,
        minLat: 36.7, maxLat: 41.0,
        width: 8.0, height: 4.3,
        centerX: 71.0, centerY: 38.5
      },
      'US': { // Continental US only
        minLon: -125.0, maxLon: -66.93457,
        minLat: 24.396308, maxLat: 49.384358
      },
      'UZ': { // Uzbekistan
        minLon: 55.9, maxLon: 73.2,
        minLat: 37.2, maxLat: 45.6,
        width: 17.0, height: 8.0,
        centerX: 64.0, centerY: 41.0
      }
    };

    const preset = COUNTRY_BOUNDS[countryCode];

    if (preset) {
      const width = preset.width ?? (preset.maxLon - preset.minLon);
      const height = preset.height ?? (preset.maxLat - preset.minLat);
      const centerX = preset.centerX ?? ((preset.minLon + preset.maxLon) / 2);
      const centerY = preset.centerY ?? ((preset.minLat + preset.maxLat) / 2);

      return {
        minLon: preset.minLon,
        maxLon: preset.maxLon,
        minLat: preset.minLat,
        maxLat: preset.maxLat,
        width,
        height,
        centerX,
        centerY
      };
    }

    // Auto-detect from coordinates
    const coords = country.geometry.coordinates.flat(Infinity);
    const lons = coords.filter((_, i) => i % 2 === 0);
    const lats = coords.filter((_, i) => i % 2 === 1);

    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    return {
      minLon,
      maxLon,
      minLat,
      maxLat,
      width: maxLon - minLon,
      height: maxLat - minLat,
      centerX: (minLon + maxLon) / 2,
      centerY: (minLat + maxLat) / 2
    };
  }

  function geoToSvgPath(country, bounds, scale, countryCode) {
    let rings = [];

    // For countries with complex territories, filter to keep only mainland parts

    if (countryCode === 'AZ') {
    // Azerbaijan - exclude Nagorno-Karabakh if problematic
    rings = country.geometry.coordinates
      .map(poly => poly[0])
      .filter(ring => {
        const centroid = getRingCentroid(ring);
        return centroid.y < 41.5; // Filter northern regions
      });

  } else if (countryCode === 'CA') { // CANADA - Make TALLER (fix vertical compression)
    const mainlandCenter = { x: -96.5, y: 62.4 };
    rings = country.geometry.coordinates
      .map(poly => poly[0])
      .filter(ring => {
        const centroid = getRingCentroid(ring);
        return centroid.x > -141 && centroid.x < -52; // Mainland only
      });
    // INCREASE HEIGHT (opposite of before)
    const heightMultiplier = 0.8; // Now >1 to EXPAND height
    return rings.map(ring =>
      'M' + ring.map(coord =>
        `${(coord[0] - bounds.centerX) * scale + 50},${((bounds.centerY - coord[1]) * scale / heightMultiplier + 50)}`
      ).join('L') + 'Z'
    ).join(' ');

  } else if (countryCode === 'DK') { // DENMARK - Make TALLER (reduce horizontal stretch)
    const mainlandCenter = { x: 10.25, y: 56.15 };
    rings = country.geometry.coordinates
      .map(poly => poly[0])
      .filter(ring => {
        const centroid = getRingCentroid(ring);
        return centroid.y > 54.5 && centroid.y < 57.8; // Jutland focus
      });
    // INCREASE HEIGHT (not width)
    const heightMultiplier = 0.75; // >1 to make taller
    return rings.map(ring =>
      'M' + ring.map(coord =>
        `${(coord[0] - bounds.centerX) * scale + 50},${((bounds.centerY - coord[1]) * scale / heightMultiplier + 50)}`
      ).join('L') + 'Z'
    ).join(' ');

  } else if (countryCode === 'ES') {
  // Spain - include mainland + Balearic Islands
  rings = country.geometry.coordinates
    .map(poly => poly[0])
    .filter(ring => {
      const centroid = getRingCentroid(ring);
      return (
        (centroid.x > -10 && centroid.x < 4.5) ||  // Mainland
        (centroid.x > 0 && centroid.x < 4.5 && centroid.y > 38 && centroid.y < 40)  // Balearics
      );
    });

  } else if (countryCode === 'FR') {
      // For France, keep polygons near mainland France
      const mainlandCenter = { x: 2.2, y: 46.2 };
      rings = country.geometry.coordinates
        .map(poly => poly[0])
        .filter(ring => {
          const centroid = getRingCentroid(ring);
          const dist = Math.hypot(centroid.x - mainlandCenter.x, centroid.y - mainlandCenter.y);
          return dist < 8; // Keep rings within ~8 degrees of mainland center
        });

    } else if (countryCode === 'UK') {
      // UK - filter to mainland (exclude Northern Ireland if problematic)
      const mainlandCenter = { x: -2.0, y: 54.0 };
      rings = country.geometry.coordinates
        .map(poly => poly[0])
        .filter(ring => {
          const centroid = getRingCentroid(ring);
          // Keep only polygons near Great Britain
          return centroid.y > 50.0 && centroid.y < 59.0;
        });
      return rings.map(ring =>
        'M' + ring.map(coord =>
          `${(coord[0] - bounds.centerX) * scale + 50},${(bounds.centerY - coord[1]) * scale + 50}`
        ).join('L') + 'Z'
      ).join(' ');

    } else if (countryCode === 'ID') {
    // Indonesia - filter to 5 main islands
    const mainIslands = [
      { minLon: 95, maxLon: 141, minLat: -11, maxLat: 6 } // Sumatra to Papua
    ];
    rings = country.geometry.coordinates
      .map(poly => poly[0])
      .filter(ring => {
        const centroid = getRingCentroid(ring);
        return mainIslands.some(area => 
          centroid.x > area.minLon && centroid.x < area.maxLon &&
          centroid.y > area.minLat && centroid.y < area.maxLat
        );
      });

    } else if (countryCode === 'IS') {
      // For Iceland, adjust scaling to maintain natural aspect ratio (~3:1 width:height)
      const mainlandCenter = { x: -19.0, y: 64.95 };
      rings = country.geometry.coordinates
        .map(poly => poly[0])
        .filter(ring => {
          const centroid = getRingCentroid(ring);
          const dist = Math.hypot(centroid.x - mainlandCenter.x, centroid.y - mainlandCenter.y);
          return dist < 6;
        });

    } else if (countryCode === 'JP') {
      // For Japan, keep main islands
      const center = { x: 138.0, y: 36.0 };
      rings = country.geometry.coordinates
        .map(poly => poly[0])
        .filter(ring => {
          const centroid = getRingCentroid(ring);
          const dist = Math.hypot(centroid.x - center.x, centroid.y - center.y);
          return dist < 20;
        });

    } else if (countryCode === 'MY') {
    // Malaysia - combine West (Peninsula) and East (Borneo)
    rings = country.geometry.coordinates
      .map(poly => poly[0])
      .filter(ring => {
        const centroid = getRingCentroid(ring);
        return (
          (centroid.x > 99 && centroid.x < 105) ||  // West Malaysia
          (centroid.x > 110 && centroid.x < 120)    // East Malaysia
        );
    });

    } else if (countryCode === 'NO') {
      // For Norway, keep polygons near mainland Norway
      const mainlandCenter = { x: 10.0, y: 64.0 };
      rings = country.geometry.coordinates
        .map(poly => poly[0])
        .filter(ring => {
          const centroid = getRingCentroid(ring);
          const dist = Math.hypot(centroid.x - mainlandCenter.x, centroid.y - mainlandCenter.y);
          return dist < 15; // Keep rings within ~15 degrees of mainland center
        });
      // Apply aspect ratio correction (scale height less than width)
      const aspectCorrection = 2;
      return rings.map(ring =>
        'M' + ring.map(coord =>
          `${(coord[0] - bounds.centerX) * scale + 50},${((bounds.centerY - coord[1]) * scale * aspectCorrection + 50)}`
        ).join('L') + 'Z'
      ).join(' ');

    } else if (countryCode === 'NZ') {
    // New Zealand - focus on mainland
    const mainlandCenter = { x: 172.5, y: -40.5 };
    rings = country.geometry.coordinates
      .map(poly => poly[0])
      .filter(ring => {
        const centroid = getRingCentroid(ring);
        return centroid.x > 166 && centroid.x < 179; // Longitude bounds
      });

    } else if (countryCode === 'OM') {
    // Oman - exclude exclaves
    rings = country.geometry.coordinates
      .map(poly => poly[0])
      .filter(ring => {
        const centroid = getRingCentroid(ring);
        return centroid.x > 52 && centroid.x < 60; // Mainland only
      });

    } else if (countryCode === 'PH') {
    // Philippines - focus on main archipelago
    rings = country.geometry.coordinates
      .map(poly => poly[0])
      .filter(ring => {
        const centroid = getRingCentroid(ring);
        return centroid.x > 116 && centroid.x < 127; // Longitude bounds
      });

    } else if (countryCode === 'TJ') {
    // Tajikistan - ensure all border regions are included
    rings = country.geometry.coordinates.flatMap(poly => 
      Array.isArray(poly[0]) ? poly : [poly]
    ).filter(ring => {
      const centroid = getRingCentroid(ring);
      return centroid.x > 67 && centroid.x < 75.5;
    });

    } else if (countryCode === 'UZ') {
    // Uzbekistan - include all mainland areas
    rings = country.geometry.coordinates.flatMap(poly => 
      Array.isArray(poly[0]) ? poly : [poly]
    );

  // Handle GeometryCollection (merged territories)
  } else if (country.geometry.type === "GeometryCollection") {
    country.geometry.geometries.forEach(geom => {
      if (geom.type === "Polygon") {
        rings.push(geom.coordinates[0]);
      } else if (geom.type === "MultiPolygon") {
        geom.coordinates.forEach(poly => rings.push(poly[0]));
      }
    });

    } else if (country.geometry.type === "MultiPolygon") {
      rings = [country.geometry.coordinates[0][0]];
    } else if (country.geometry.type === "Polygon") {
      rings = [country.geometry.coordinates[0]];
    }

    if (!rings.length) {
      console.warn('Using fallback rectangle for', country.properties.NAME);
      return 'M30,30 L70,30 L70,70 L30,70 Z';
    }

    return rings.map(ring =>
      'M' + ring.map(coord =>
        `${(coord[0] - bounds.centerX) * scale + 50},${(bounds.centerY - coord[1]) * scale + 50}`
      ).join('L') + 'Z'
    ).join(' ');
  }

  // Helper function to calculate centroid of a ring
  function getRingCentroid(ring) {
    const totalCoords = ring.length;
    const centroid = ring.reduce((acc, coord) => ({
      x: acc.x + coord[0] / totalCoords,
      y: acc.y + coord[1] / totalCoords
    }), { x: 0, y: 0 });
    return centroid;
  }

    // Font adjustment
  function adjustFontSize(element) {
    const container = element;
    const maxWidth = container.offsetWidth;
    let min = 8;
    let max = 28;
    
    container.style.fontSize = max + 'px';
    
    if (container.scrollWidth > maxWidth) {
      while (min <= max) {
        const mid = Math.floor((min + max) / 2);
        container.style.fontSize = mid + 'px';
        container.scrollWidth > maxWidth ? max = mid - 1 : min = mid + 1;
      }
      container.style.fontSize = max + 'px';
    }
  }

async function initializePage() {
  try {
    const location = await getApproximateLocation();
    await displayLocation(location);
  } catch (error) {
    showErrorState();
  }
}

// Initialize the page
initializePage();

document.getElementById('seeCity')?.addEventListener('click', () => selectCity(false));
document.getElementById('changeCity')?.addEventListener('click', () => selectCity(true));

});