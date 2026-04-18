const weatherDescriptions = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Drizzle: Light",
  61: "Rain: Slight",
  63: "Rain: Moderate",
  65: "Rain: Heavy",
  80: "Rain showers: Slight",
  95: "Thunderstorm",
  99: "Thunderstorm: Heavy hail",
};

async function getCoordinates(city) {
  showError("");
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );

    if (!response.ok) {
      throw new Error("City not found");
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error("Location not found");
    }

    const { latitude, longitude, name, country } = data.results[0];
    getWeather(latitude, longitude, name, country);
  } catch (error) {
    showError(error.message);
  }
}

async function getWeather(latitude, longitude, city, country) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );

    if (!response.ok) {
      throw new Error("Weather data not available");
    }

    const data = await response.json();
    displayWeather(data.current_weather, city, country);
  } catch (error) {
    showError(error.message);
  }
}

function displayWeather(weather, city, country) {
  const weatherContainer = document.getElementById("weatherContainer");
  const cityHeader = document.getElementById("cityName");
  const temp = document.getElementById("temperature");
  const condition = document.getElementById("condition");
  const windSpeed = document.getElementById("wind_speed_10m") || "Unknown";
  const weatherCondition =
    weatherDescriptions[weather.weathercode] || "Unknown Condition";

  weatherContainer.style.display = "block";
  cityHeader.textContent = `${city}, ${country}`;
  temp.textContent = `Temperature: ${weather.temperature}°C`;
  condition.textContent = `Condition: ${weatherCondition}`;
  windSpeed.textContent = `Wind Speed: ${weather.windSpeed} km/h`;
}

function showError(message) {
  const weatherContainer = document.getElementById("weatherContainer");
  weatherContainer.style.display = "none";
  const errorPara = document.getElementById("errorMessage");
  errorPara.textContent = message;
}

// Event listener for search button
document.getElementById("searchBtn").addEventListener("click", () => {
  const city = document.getElementById("cityField").value.trim();
  if (city) {
    getCoordinates(city);
  } else {
    showError("Please enter a city name");
  }
});

// The correct answer (you can change this easily)
const correctAnswer = "888 + 88 + 8 + 8 + 8 = 1000";   // or just "1000" if you want to accept the result

function checkAnswer() {
  const userInput = document.getElementById("user-answer").value.trim();
  const feedback = document.getElementById("feedback");
  const quoteSection = document.getElementById("quote-section");
  
  // Simple check (case-insensitive, allows some flexibility)
  if (userInput.toLowerCase().includes("888") && 
      (userInput.includes("88") || userInput.includes("1000"))) {
    
    feedback.style.color = "green";
    feedback.textContent = "Correct! Well done 🎉";
    
    // Show quote
    quoteSection.style.display = "block";
    fetchRandomQuote();
    
  } else {
    feedback.style.color = "red";
    feedback.textContent = "Not quite. Try again! (Hint: think about grouping the 8's)";
  }
}

// Fetch a random famous quote (using Quotable.io — completely free, no API key needed)
async function fetchRandomQuote() {
  try {
    const response = await fetch("https://api.quotable.io/random");
    const data = await response.json();
    
    document.getElementById("quote-text").textContent = `"${data.content}"`;
    document.getElementById("quote-author").textContent = `— ${data.author}`;
    
  } catch (error) {
    console.error("Quote API error:", error);
    // Fallback quote if API fails
    document.getElementById("quote-text").textContent = "\"The only way to do great work is to love what you do.\"";
    document.getElementById("quote-author").textContent = "— Steve Jobs";
  }
}

