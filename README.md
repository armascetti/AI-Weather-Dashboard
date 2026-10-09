# AI Weather Dashboard

An AI-powered weather application built with React, Node.js, Express, and OpenAI. Users can search for cities worldwide, view current weather conditions, explore short-term forecasts, and generate AI-powered weather briefings based on real-time weather data.

## Setup

1. Create `server/.env` from the environment example values.
2. Add your OpenAI, RapidAPI, and OpenWeather API keys to `server/.env`.
3. Start the server with `node server/server.js`.
4. Start the React app with `npm start`.

The `.env` file is ignored by Git. API keys are read only by the Express server and are never bundled into the React application.

> Rotate any API keys that were previously committed to source code or exposed in a public build.

## Features

* Search for cities worldwide using the GeoDB Cities API
* View current weather conditions including:

  * Temperature
  * Feels Like Temperature
  * Humidity
  * Wind Speed
  * Weather Conditions
* Display 5-period weather forecast with weather icons
* Responsive and modern UI with custom styling
* AI-generated weather briefings using OpenAI
* Real-time weather insights based on forecast and current conditions
* Dynamic weather icons from OpenWeather

## Technologies Used

### Frontend

* React
* JavaScript (ES6+)
* HTML5
* CSS3

### Backend

* Node.js
* Express.js

### APIs

* OpenWeather API
* GeoDB Cities API
* OpenAI API

## Architecture

Frontend (React)
↓
GeoDB API (City Search)
↓
OpenWeather API (Current Weather & Forecast)
↓
Node/Express Backend
↓
OpenAI API
↓
AI Weather Briefing

## What I Learned

* React state management using useState
* API integration and asynchronous data fetching
* Handling multiple API requests with Promise.all()
* Conditional rendering in React
* Dynamic UI rendering with map()
* Building REST endpoints with Express
* Secure API key management using environment variables
* Integrating generative AI into a full-stack application
* Connecting React frontends to Node.js backends

## Future Enhancements

* AI clothing recommendations based on weather conditions
* AI activity suggestions for outdoor and indoor plans
* Recent search history
* Favorite locations
* Weather alerts and notifications
* Multi-day forecast visualizations
* Deployment to a cloud hosting platform

## Author

Amanda Mascetti
