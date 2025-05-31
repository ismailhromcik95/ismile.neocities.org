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

    function showErrorState() {
    document.getElementById('weather-icon').textContent = "⚠️";
    document.getElementById('weather-text').textContent = "Weather unavailable";
    document.querySelector('.city').textContent = "--";
    document.querySelectorAll('.value').forEach(el => el.textContent = "--");
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