import Search from './Components/Search/Search';
import './App.css';
import { WEATHER_API_URL, WEATHER_API_KEY } from './API';
import { useState } from "react";

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

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

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  const handleCopy = () => {
    if (!aiSummary) return;
    navigator.clipboard.writeText(aiSummary).then(() => {
      setSnackMessage('Copied AI briefing to clipboard');
      setSnackOpen(true);
    });
  };

  const handleDownload = () => {
    if (!aiSummary) return;
    const blob = new Blob([aiSummary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentWeather.name}-weather-briefing.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setSnackMessage('Downloaded AI briefing');
    setSnackOpen(true);
  };

  return (
    <Box className="container" sx={{ maxWidth: 1100, mx: 'auto', p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Search onSearchChange={handleOnSearchChange} />
      </Box>

      {currentWeather && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 3, p: 1 }}>
              <CardContent sx={{ textAlign: 'left' }}>
                <Typography variant="h5" component="div">
                  {currentWeather.name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <CardMedia
                    component="img"
                    image={`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`}
                    alt={currentWeather.weather[0].description}
                    sx={{ width: 96, height: 96 }}
                  />

                  <Box>
                    <Typography variant="h2" sx={{ fontSize: 48, color: 'primary.main' }}>
                      {Math.round(currentWeather.main.temp)}°F
                    </Typography>
                    <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                      {currentWeather.weather[0].description}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography>Feels Like: {Math.round(currentWeather.main.feels_like)}°F</Typography>
                  <Typography>Humidity: {currentWeather.main.humidity}%</Typography>
                  <Typography>Wind: {currentWeather.wind.speed} mph</Typography>
                </Box>

                {forecast && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6">Forecast</Typography>
                    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', mt: 1 }}>
                      {forecast.list.slice(0, 5).map((item, index) => (
                        <Card key={index} sx={{ minWidth: 140, borderRadius: 2 }}>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography sx={{ fontWeight: 700 }}>
                              {new Date(item.dt_txt).toLocaleDateString('en-US', { weekday: 'short' })}
                            </Typography>
                            <Typography>
                              {new Date(item.dt_txt).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
                            </Typography>
                            <CardMedia
                              component="img"
                              image={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                              alt={item.weather[0].description}
                              sx={{ width: 60, height: 60, mx: 'auto' }}
                            />
                            <Typography sx={{ fontWeight: 600 }}>{Math.round(item.main.temp)}°F</Typography>
                            <Typography sx={{ textTransform: 'capitalize' }}>{item.weather[0].description}</Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {currentWeather && forecast && (
            <Grid item xs={12} md={5}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>AI Weather Briefing</Typography>

                  <Button variant="contained" onClick={generateAiSummary} disabled={aiLoading}>
                    {aiLoading ? <CircularProgress size={20} color="inherit" /> : 'Generate AI Briefing'}
                  </Button>

                  <Box sx={{ mt: 2 }}>
                    {aiLoading && <Typography>Generating summary...</Typography>}

                    {aiSummary && (
                      <Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <IconButton aria-label="copy" size="small" onClick={handleCopy}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                          <IconButton aria-label="download" size="small" onClick={handleDownload}>
                            <FileDownloadIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography sx={{ whiteSpace: 'pre-line', mt: 1 }}>{aiSummary}</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)}>
        <Alert onClose={() => setSnackOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;