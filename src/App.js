import Search from './Components/Search/Search';
import './App.css';
import { WEATHER_API_URL, WEATHER_API_KEY } from './API';
import { useState } from "react";

function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleOnSearchChange = (searchData) => {
    const [lat, lon] = searchData.value.split(" ");

    const currentWeatherFetch = fetch(
      `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=imperial`
    );

    const forecastFetch = fetch(
      `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=imperial`
    );

    Promise.all([currentWeatherFetch, forecastFetch])
      .then(async (responses) => {
        const weatherResponse = await responses[0].json();
        const forecastResponse = await responses[1].json();

        setCurrentWeather(weatherResponse);
        setForecast(forecastResponse);
      })
      .catch((error) => console.log(error));
  };

  const generateAiSummary = () => {
    setAiLoading(true);

    fetch("http://localhost:5000/api/weather-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentWeather,
        forecast,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setAiSummary(data.summary);
        setAiLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setAiLoading(false);
      });
  };

  return (
    <div className="container">
      <Search onSearchChange={handleOnSearchChange} />

      {currentWeather && (
        <div className="weather-card">
          <h2>{currentWeather.name}</h2>

          <img
            className="current-weather-icon"
            src={`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`}
            alt={currentWeather.weather[0].description}
          />

          <h1>{Math.round(currentWeather.main.temp)}°F</h1>

          <p>{currentWeather.weather[0].description}</p>

          <hr />

          <p>Feels Like: {Math.round(currentWeather.main.feels_like)}°F</p>
          <p>Humidity: {currentWeather.main.humidity}%</p>
          <p>Wind: {currentWeather.wind.speed} mph</p>

          {forecast && (
            <div className="forecast-container">
              <h3>Forecast</h3>

              <div className="forecast-cards">
                {forecast.list.slice(0, 5).map((item, index) => (
                  <div className="forecast-card" key={index}>
                    <p className="forecast-day">
                      {new Date(item.dt_txt).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </p>

                    <p>
                      {new Date(item.dt_txt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        hour12: true,
                      })}
                    </p>

                    <img
                      className="forecast-icon"
                      src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                      alt={item.weather[0].description}
                    />

                    <p>{Math.round(item.main.temp)}°F</p>
                    <p>{item.weather[0].description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {currentWeather && forecast && (
        <div className="ai-insight-card">
          <h3>AI Weather Briefing</h3>

          <button onClick={generateAiSummary}>
            Generate AI Briefing
          </button>

          {aiLoading && <p>Generating summary...</p>}

          {aiSummary && <p>{aiSummary}</p>}
        </div>
      )}
    </div>
  );
}

export default App;