Weather App

A simple weather application built with HTML, CSS, and JavaScript. The app allows users to search for weather by city, ZIP code, or state, and also supports current-location weather using the browser's geolocation feature.

Features
Search weather by city, ZIP code, or state
Use current location to get local weather
Displays current temperature
Shows weather conditions
Displays humidity and wind speed
Includes a 5-day forecast
Uses Visual Crossing Weather API
Uses reverse geocoding to show city name instead of coordinates
Technologies Used
HTML
CSS
JavaScript
Visual Crossing Weather API
BigDataCloud Reverse Geocoding API
Project Files
weather-app/
├── index.html
├── main.css
├── app.js
└── README.md
How to Run Locally

Open the project folder in VS Code.

Then run this command in the terminal:

python3 -m http.server 8000

Open your browser and go to:

http://localhost:8000
API Key

This project uses the Visual Crossing Weather API.

In app.js, replace the API key with your own if needed:

const apiKey = 'YOUR_API_KEY_HERE';
How to Use
Enter a city, ZIP code, or state.
Click Search.
Or click Use My Location to get weather based on your current location.
View current weather and the 5-day forecast.
Future Improvements
Add loading animations
Improve mobile styling
Add hourly forecast
Add dark mode
Hide API key using a backend server
Deploy with GitHub Pages, Netlify, or Vercel
Author

Gabriel Gutierrez
