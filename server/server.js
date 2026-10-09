const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/api/cities", async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query) {
      return res.status(400).json({ error: "A city search query is required" });
    }

    const url = new URL("https://wft-geo-db.p.rapidapi.com/v1/geo/cities");
    url.searchParams.set("name", query);
    url.searchParams.set("count", req.query.limit || 5);

    const response = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
      },
    });

    if (!response.ok) {
      throw new Error(`GeoDB request failed with status ${response.status}`);
    }

    const responseBody = await response.json();
    const cities = Array.isArray(responseBody) ? responseBody : responseBody.data;

    if (!Array.isArray(cities)) {
      throw new Error("GeoDB returned an unexpected response format");
    }

    return res.json(cities);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to search for cities" });
  }
});

app.get("/api/weather", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    const apiUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
    apiUrl.searchParams.set("lat", lat);
    apiUrl.searchParams.set("lon", lon);
    apiUrl.searchParams.set("appid", process.env.OPENWEATHER_API_KEY);
    apiUrl.searchParams.set("units", req.query.units || "imperial");

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`OpenWeather request failed with status ${response.status}`);
    }

    return res.json(await response.json());
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to retrieve weather data" });
  }
});

app.get("/api/forecast", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    const apiUrl = new URL("https://api.openweathermap.org/data/2.5/forecast");
    apiUrl.searchParams.set("lat", lat);
    apiUrl.searchParams.set("lon", lon);
    apiUrl.searchParams.set("appid", process.env.OPENWEATHER_API_KEY);
    apiUrl.searchParams.set("units", req.query.units || "imperial");

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`OpenWeather forecast request failed with status ${response.status}`);
    }

    return res.json(await response.json());
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to retrieve forecast data" });
  }
});

app.post("/api/weather-summary", async (req, res) => {
  try {
    const { currentWeather, forecast } = req.body;

    const prompt = `
Create a short helpful weather briefing based on this data.

Current weather:
City: ${currentWeather.name}
Temperature: ${currentWeather.main.temp}
Feels like: ${currentWeather.main.feels_like}
Humidity: ${currentWeather.main.humidity}
Wind: ${currentWeather.wind.speed}
Description: ${currentWeather.weather[0].description}

Forecast sample:
${forecast.list.slice(0, 5).map(item => `
Time: ${item.dt_txt}
Temp: ${item.main.temp}
Description: ${item.weather[0].description}
`).join("")}

Give:
1. A short summary
2. What to wear
3. Best outdoor activity advice

Return plain text only. Do not use markdown, asterisks, bullet points, or special formatting.

`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    res.json({ summary: response.output_text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate weather summary" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

