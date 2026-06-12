require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

