import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { IWeatherListItem } from "../../../models/IWeatherListItem";
import { IWeatherResponse } from "../../../models/IWeatherResponse";
import styles from "./LocationWeather.module.scss";
import { HttpClient } from "@microsoft/sp-http";
import { WeatherService } from "../../../services/OpenWeatherService";

interface LocationWeatherProps {
  location: IWeatherListItem;
  httpClient: HttpClient;
}

const LocationWeather: React.FC<LocationWeatherProps> = ({
  location,
  httpClient,
}) => {
  const [weatherData, setWeatherData] = useState<IWeatherResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const weatherService = new WeatherService(httpClient);
      const data = await weatherService.getWeather(
        location.City,
        location.State,
        "us"
      );
      setWeatherData(data);
      console.log("Weather data:", data);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError("Failed to load weather data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [location, httpClient]);

  useEffect(() => {
    void fetchWeatherData();
  }, [fetchWeatherData]);

  if (loading) {
    return (
      <div className={styles["location-weather__loading"]}>
        Loading weather data...
      </div>
    );
  }

  if (error) {
    return <div className={styles["location-weather__error"]}>{error}</div>;
  }

  if (!weatherData) {
    return (
      <div className={styles["location-weather__error"]}>
        No weather data available
      </div>
    );
  }

  return (
    <div className={styles["location-weather"]}>
      <h3 className={styles["location-weather__title"]}>
        Current weather in {location.City}, {location.State}
      </h3>
      <div className={styles["location-weather__content"]}>
        <div className={styles["location-weather__main"]}>
          <div className={styles["location-weather__temp"]}>
            <span className={styles["location-weather__temp-value"]}>
              {Math.round(weatherData.main.temp)}°F
            </span>
            <span className={styles["location-weather__feels-like"]}>
              Feels like {Math.round(weatherData.main.feels_like)}°F
            </span>
          </div>

          {weatherData.weather && weatherData.weather[0] && (
            <div className={styles["location-weather__condition"]}>
              <span className={styles["location-weather__description"]}>
                {weatherData.weather[0].description}
              </span>
            </div>
          )}
        </div>

        <div className={styles["location-weather__details"]}>
          <div className={styles["location-weather__detail-row"]}>
            <span className={styles["location-weather__detail-label"]}>
              Humidity:
            </span>
            <span>{weatherData.main.humidity}%</span>
          </div>
          <div className={styles["location-weather__detail-row"]}>
            <span className={styles["location-weather__detail-label"]}>
              Wind:
            </span>
            <span>{Math.round(weatherData.wind.speed)} mph</span>
          </div>
          <div className={styles["location-weather__detail-row"]}>
            <span className={styles["location-weather__detail-label"]}>
              Pressure:
            </span>
            <span>{weatherData.main.pressure} hPa</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationWeather;
