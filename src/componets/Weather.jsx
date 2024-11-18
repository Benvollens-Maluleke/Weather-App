import React, { useEffect, useState } from 'react';
import './Weather.css';
import searchIcon1 from '../assets/search.jpg';
import sunnyIcon from '../assets/Sun Icon.png';
import HumidityIcon from '../assets/Himidty.jpg';
import WindIcon from '../assets/windspeed.png';

const Weather = () => {
  const [city, setCity] = useState("Phalaborwa");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [searchCity, setSearchCity] = useState("");
  const [error, setError] = useState(""); // State for error message

  const fetchWeather = async (city) => {
    try {
      const apiKey = import.meta.env.VITE_APP_ID;

      // Current weather data
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
      const weatherResponse = await fetch(weatherUrl);

      if (!weatherResponse.ok) {
        throw new Error(`City not found`); // Handle invalid city
      }

      const weather = await weatherResponse.json();

      // Forecast data
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
      const forecastResponse = await fetch(forecastUrl);

      if (!forecastResponse.ok) {
        throw new Error("Forecast data not available");
      }

      const forecast = await forecastResponse.json();

      // Set current weather
      setWeatherData({
        name: weather.name,
        humidity: weather.main.humidity,
        windSpeed: weather.wind.speed,
        temperature: weather.main.temp,
      });

      // Extract data for next 4 days
      const dailyForecast = forecast.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      ).slice(0, 4);

      setForecastData(
        dailyForecast.map((day) => ({
          date: new Date(day.dt * 1000).toLocaleDateString("en-US", {
            weekday: "short",
          }),
          temperature: Math.round(day.main.temp),
          icon: `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`,
        }))
      );

      setError(""); // Clear any previous errors
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError(error.message); // Set error message
      setWeatherData(null); // Clear previous weather data
      setForecastData([]); // Clear previous forecast data
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, [city]);

  const handleSearch = () => {
    if (searchCity.trim()) {
      setCity(searchCity);
      setSearchCity("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className='Weather'>
      <div className='Search-bar'>
        <input
          type="text"
          placeholder='Search'
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <img src={searchIcon1} alt="Search" onClick={handleSearch} />
      </div>

      {error && <p className='Error'>{error}</p>} {/* Display error message */}

      {weatherData && (
        <>
          <img src={sunnyIcon} alt="Sunny icon" className='Weather-icon' />
          <p className='Temperature'>{Math.round(weatherData.temperature)}°C</p>
          <p className='Location'>{weatherData.name}</p>

          <div className='weather-data'>
            <div className='col'>
              <img src={HumidityIcon} alt="Humidity icon" />
              <div>
                <p>{weatherData.humidity}%</p>
                <span>Humidity</span>
              </div>
            </div>

            <div className='col'>
              <img src={WindIcon} alt="Wind speed icon" />
              <div>
                <p>{weatherData.windSpeed} Km/h</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
        </>
      )}

      {forecastData.length > 0 && (
        <div className='forecast'>
          <h3>Next 4 Days</h3>
          <div className='forecast-grid'>
            {forecastData.map((day, index) => (
              <div className='forecast-day' key={index}>
                <p>{day.date}</p>
                <img src={day.icon} alt="Weather icon" />
                <p>{day.temperature}°C</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
