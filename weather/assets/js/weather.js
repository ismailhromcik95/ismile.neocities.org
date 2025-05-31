document.addEventListener('DOMContentLoaded', function() {
  // Weather icon mapping (WMO codes)
  const weatherIcons = {
    0: '☀️',  1: '🌤️',  2: '⛅',  3: '☁️',
    45: '🌫️', 48: '🌫️', 51: '🌧️', 53: '🌧️',
    55: '🌧️', 56: '🌧️', 57: '🌧️', 61: '🌧️',
    63: '🌧️', 65: '🌧️', 66: '🌧️', 67: '🌧️',
    71: '❄️', 73: '❄️', 75: '❄️', 77: '❄️',
    80: '🌧️', 81: '🌧️', 82: '🌧️', 85: '❄️',
    86: '❄️', 95: '⛈️', 96: '⛈️', 99: '⛈️',
    default: '🌈'
  };

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

  // Weather descriptions
  function getWeatherDesc(code) {
    const descriptions = {
      0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
      55: 'Dense drizzle', 56: 'Freezing drizzle', 57: 'Dense freezing drizzle',
      61: 'Light rain', 63: 'Moderate rain', 65: 'Heavy rain',
      66: 'Freezing rain', 67: 'Heavy freezing rain', 71: 'Light snow',
      73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains',
      80: 'Rain showers', 81: 'Heavy rain showers', 82: 'Violent rain showers',
      85: 'Snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorm',
      96: 'Thunderstorm with hail', 99: 'Severe thunderstorm'
    };
    return descriptions[code] || 'Unknown weather';
  }

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

  // Core weather fetching with location parameter
  async function fetchWeatherWithLocation(location) {
    console.log("Fetching weather for:", location);
    try {
      document.querySelectorAll('.value').forEach(el => el.textContent = "--");

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=weather_code,temperature_2m,wind_speed_10m,wind_direction_10m,relative_humidity_2m,pressure_msl&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=auto`;
      
      const response = await fetch(weatherUrl);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();

      // Update all displays
      updateSimpleWeather(data.current.weather_code, data.current.temperature_2m);
      updateDetailedWeather({
        location: `${location.city}, ${location.country}`,
        condition: data.current.weather_code,
        tempC: Math.round((data.current.temperature_2m - 32) * 5/9),
        tempF: data.current.temperature_2m,
        wind: data.current.wind_speed_10m,
        windDir: degToCompass(data.current.wind_direction_10m),
        humidity: data.current.relative_humidity_2m,
        pressure: data.current.pressure_msl
      });
      updateSevenDayForecast(data.daily);
      
    } catch (error) {
      console.error("Weather fetch failed:", error);
      showErrorState();
    }
  }

  // Display functions
  function updateSimpleWeather(weatherCode, tempF) {
    const iconElement = document.getElementById('weather-icon');
    const textElement = document.getElementById('weather-text');
    if (iconElement && textElement) {
      const tempC = Math.round((tempF - 32) * 5/9);
      iconElement.textContent = weatherIcons[weatherCode] || weatherIcons.default;
      textElement.textContent = `${getWeatherDesc(weatherCode)} ${tempC}°C/${tempF.toFixed(1)}°F`;
    }
  }

  function updateDetailedWeather({ location, condition, tempC, tempF, wind, windDir, humidity, pressure }) {
  // Replace "PS" with "Palestine" in location string
  const formattedLocation = location.replace(/, PS$/, ', Palestine');
  
  document.querySelectorAll('.city').forEach(el => {
    el.textContent = formattedLocation; // Now shows "Hebron, Palestine"
    adjustFontSize(el);
  });
    document.querySelector('.temp').textContent = `${tempF}°F/${tempC}°C`;
    document.querySelector('.cond').textContent = getWeatherDesc(condition);
    document.querySelector('.wind').textContent = `${windDir} ${wind} mph/${(wind * 1.60934).toFixed(1)} kph`;
    document.querySelector('.humid').textContent = `${humidity}%`;
    document.querySelector('.barom').textContent = `${(pressure / 33.8639).toFixed(2)}inHg/${pressure}hPa`;
  }

  function updateSevenDayForecast(dailyData) {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    dailyData.time.slice(0, 7).forEach((dateStr, index) => {
      const dayElement = document.querySelector(`.day${index + 1}`);
      if (!dayElement) return;
      
      const date = new Date(dateStr);
      dayElement.innerHTML = `
        <div class="day-name">${days[date.getDay()]} <span class="weather-icon">${weatherIcons[dailyData.weather_code[index]] || weatherIcons.default}</span></div>
        <div class="max-temp">${Math.round(dailyData.temperature_2m_max[index])}°F/${Math.round((dailyData.temperature_2m_max[index] - 32) * 5/9)}°C</div>
        <div class="min-temp">${Math.round(dailyData.temperature_2m_min[index])}°F/${Math.round((dailyData.temperature_2m_min[index] - 32) * 5/9)}°C</div>
      `;
    });
  }

  function showErrorState() {
    document.getElementById('weather-icon').textContent = "⚠️";
    document.getElementById('weather-text').textContent = "Weather unavailable";
    document.querySelector('.city').textContent = "--";
    document.querySelectorAll('.value').forEach(el => el.textContent = "--");
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

  // Main weather fetching function
  async function fetchWeather() {
    try {
      const location = await getApproximateLocation();
      await fetchWeatherWithLocation(location);
    } catch (error) {
      console.error("Failed to fetch weather:", error);
      showErrorState();
    }
  }

  // Initialize
  fetchWeather();

});