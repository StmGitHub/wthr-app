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

const dailyMathPuzzles = [
  {
    prompt:
      "Using only the digit 8 and the operations +, make the number 1000.",
    hint: "It uses five 8s.",
    validate: (input) => {
      const compact = input.replace(/\s+/g, "");
      return compact === "888+88+8+8+8=1000" || compact === "888+88+8+8+8";
    },
  },
  {
    prompt: "What is 12 × 12?",
    hint: "It is a square number.",
    validate: (input) => input.replace(/\s+/g, "") === "144",
  },
  {
    prompt:
      "If 3 cats catch 3 mice in 3 minutes, how many cats catch 100 mice in 100 minutes?",
    hint: "Focus on each cat's rate.",
    validate: (input) => input.replace(/\s+/g, "") === "3",
  },
  {
    prompt: "What comes next in the pattern: 2, 6, 12, 20, 30, ?",
    hint: "n(n+1)",
    validate: (input) => input.replace(/\s+/g, "") === "42",
  },
  {
    prompt: "I am an odd number. Take away one letter and I become even. What am I?",
    hint: "Try writing the number as a word.",
    validate: (input) => {
      const normalized = input.trim().toLowerCase();
      return normalized === "seven" || normalized === "7";
    },
  },
];

const dailyQuoteStorageKey = "dailyQuote";
let activeDailyPuzzle = null;

function getDateKey() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function getDailyPuzzle() {
  const dateKey = getDateKey();
  const dateSeed = Number(dateKey.replace(/-/g, ""));
  const index = dateSeed % dailyMathPuzzles.length;
  return dailyMathPuzzles[index];
}

function initializeDailyPuzzle() {
  activeDailyPuzzle = getDailyPuzzle();
  const puzzleText = document.getElementById("puzzle-text");
  const puzzleHint = document.getElementById("puzzle-hint");
  if (puzzleText) {
    puzzleText.textContent = activeDailyPuzzle.prompt;
  }
  if (puzzleHint) {
    puzzleHint.textContent = `Hint: ${activeDailyPuzzle.hint}`;
  }
}

function checkAnswer() {
  const userInput = document.getElementById("user-answer").value.trim();
  const feedback = document.getElementById("feedback");
  const quoteSection = document.getElementById("quote-section");
  
  if (!activeDailyPuzzle) {
    initializeDailyPuzzle();
  }

  if (activeDailyPuzzle.validate(userInput)) {
    
    feedback.style.color = "green";
    feedback.textContent = "Correct! Well done 🎉";
    
    // Show quote
    quoteSection.style.display = "block";
    fetchDailyQuote();
    
  } else {
    feedback.style.color = "red";
    feedback.textContent = "Not quite. Try again using the hint above.";
  }
}

// Fetch a random famous quote (using Quotable.io — completely free, no API key needed)
async function fetchDailyQuote() {
  const dateKey = getDateKey();
  const cachedQuote = localStorage.getItem(dailyQuoteStorageKey);
  if (cachedQuote) {
    try {
      const parsedQuote = JSON.parse(cachedQuote);
      if (
        parsedQuote.dateKey === dateKey &&
        parsedQuote.content &&
        parsedQuote.author
      ) {
        document.getElementById("quote-text").textContent = `"${parsedQuote.content}"`;
        document.getElementById("quote-author").textContent = `— ${parsedQuote.author}`;
        return;
      }
    } catch (error) {
      localStorage.removeItem(dailyQuoteStorageKey);
    }
  }
  try {
    const response = await fetch("https://api.quotable.io/random");
    const data = await response.json();
    localStorage.setItem(
      dailyQuoteStorageKey,
      JSON.stringify({
        dateKey,
        content: data.content,
        author: data.author,
      })
    );
    
    document.getElementById("quote-text").textContent = `"${data.content}"`;
    document.getElementById("quote-author").textContent = `— ${data.author}`;
    
  } catch (error) {
    console.error("Quote API error:", error);
    // Fallback quote if API fails
    document.getElementById("quote-text").textContent = "\"The only way to do great work is to love what you do.\"";
    document.getElementById("quote-author").textContent = "— Steve Jobs";
  }
}

initializeDailyPuzzle();

