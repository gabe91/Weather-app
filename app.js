// =========================
// Elements
// =========================
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('current-location-btn');
const result = document.getElementById('weather-card');
const cityInput = document.getElementById('city-input');

const apiKey = 'YC8ATKDTHYD96XXQ6JGYERX64'; // Visual Crossing API Key (replace with your own if needed)


// =========================
// FETCH WEATHER DATA
// =========================
async function fetchWeatherData(location) {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=us&key=${apiKey}&contentType=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
}

async function fetchLocationName(latitude, longitude) {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&localityLanguage=en`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Reverse geocode error: ${response.status}`);
    }

    const data = await response.json();
    const city = data.city || data.locality || data.principalSubdivision;
    const state = data.principalSubdivisionCode || data.principalSubdivision;

    if (city && state) {
        return `${city}, ${state.replace(/^US-/, '')}`;
    }

    return city || state || null;
}


// =========================
// CLEAN LOCATION NAME (FIX FOR ZIP + GPS)
// =========================
function getCleanLocation(data) {

    // Best case: Visual Crossing provides proper name
    if (data.address && isNaN(data.address) && /[a-zA-Z]/.test(data.address)) {
        return data.address;
    }

    // Try cleaning resolvedAddress
    if (data.resolvedAddress) {
        const parts = data.resolvedAddress
            .split(',')
            .map(part => part.trim())
            .filter(part => part && !/^[-+]?\d+(?:\.\d+)?$/.test(part));

        const textParts = parts.filter(part => /[a-zA-Z]/.test(part));

        if (textParts.length >= 2) {
            return textParts.slice(0, 2).join(', ');
        }

        if (textParts.length === 1) {
            return textParts[0];
        }

        return data.resolvedAddress;
    }

    return 'Current Location';
}

function isGenericLocationName(locationName) {
    if (!locationName) return true;

    const normalized = locationName.trim().toLowerCase();

    return (
        normalized === 'usa' ||
        normalized === 'united states' ||
        normalized === 'current location' ||
        /^[-+]?\d+(?:\.\d+)?\s*,\s*[-+]?\d+(?:\.\d+)?$/.test(normalized)
    );
}

async function getDisplayLocationName(data) {
    const locationName = getCleanLocation(data);

    if (
        !isGenericLocationName(locationName) ||
        typeof data.latitude !== 'number' ||
        typeof data.longitude !== 'number'
    ) {
        return locationName;
    }

    return await fetchLocationName(data.latitude, data.longitude) || locationName;
}


// =========================
// RENDER WEATHER UI
// =========================
function renderWeather(data, overrideCity = null) {

    const getWeatherEmoji = (condition) => {
        const text = condition.toLowerCase();

        if (text.includes('sun') || text.includes('clear')) return '☀️';
        if (text.includes('cloud')) return '☁️';
        if (text.includes('rain') || text.includes('drizzle')) return '🌧️';
        if (text.includes('snow')) return '❄️';
        if (text.includes('storm') || text.includes('thunder')) return '⛈️';
        if (text.includes('fog') || text.includes('mist')) return '🌫️';

        return '🌤️';
    };

    const forecastHtml = data.days.slice(0, 5).map(day => `
        <div class="forecast-day">
            <div>${new Date(`${day.datetime}T00:00:00`).toDateString()}</div>
            <div>${getWeatherEmoji(day.conditions)}</div>
            <div>${Math.round(day.temp)}°F</div>
            <div>${Math.round(day.tempmin)}° / ${Math.round(day.tempmax)}°</div>
        </div>
    `).join('');

    const locationName =
        overrideCity || getCleanLocation(data);

    result.innerHTML = `
        <h2>📍 ${locationName}</h2>
        <p>Temp: ${data.currentConditions.temp}°F</p>
        <p>${data.currentConditions.conditions}</p>
        <p>Humidity: ${data.currentConditions.humidity}%</p>
        <p>Wind: ${data.currentConditions.windspeed} mph</p>

        <h3>5-Day Forecast</h3>
        <div class="forecast-grid">
            ${forecastHtml}
        </div>
    `;
}


// =========================
// MAIN WEATHER FUNCTION
// =========================
async function fetchWeather(location, cityOverride = null) {
    try {
        result.innerHTML = `<p>Loading weather...</p>`;

        const data = await fetchWeatherData(location);
        const locationName = cityOverride || await getDisplayLocationName(data);

        renderWeather(data, locationName);

    } catch (error) {
        console.error(error);
        result.innerHTML = `<p>Failed to load weather data.</p>`;
    }
}


// =========================
// GEOLOCATION + CITY RESOLUTION
// =========================
function getCurrentLocationWeather() {

    if (!navigator.geolocation) {
        result.innerHTML = `<p>Geolocation not supported.</p>`;
        return;
    }

    result.innerHTML = `<p>Getting your location...</p>`;

    navigator.geolocation.getCurrentPosition(
        async (position) => {

            const { latitude, longitude } = position.coords;

            try {
                const [data, locationName] = await Promise.all([
                    fetchWeatherData(`${latitude},${longitude}`),
                    fetchLocationName(latitude, longitude).catch(() => null)
                ]);

                const cityName = locationName || getCleanLocation(data);

                renderWeather(data, cityName);

            } catch (error) {
                console.error(error);
                result.innerHTML = `<p>Unable to load weather.</p>`;
            }
        },
        (error) => {
            console.error(error);
            result.innerHTML = `<p>Unable to get location.</p>`;
        }
    );
}


// =========================
// EVENTS
// =========================

// Search button (city or ZIP)
searchBtn.addEventListener('click', () => {

    const location = cityInput.value.trim();

    if (location) {
        fetchWeather(location);
    } else {
        getCurrentLocationWeather();
    }
});

// GPS button
locationBtn.addEventListener('click', () => {
    getCurrentLocationWeather();
});
