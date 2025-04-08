import * as React from "react";
// import styles from "./WeatherWp.module.scss";
import type { IWeatherWpProps } from "./IWeatherWpProps";
import { getSP } from "../../../pnpjsConfig";
import { useState, useCallback, useEffect } from "react";
import { Accordion } from "@pnp/spfx-controls-react";
import { IWeatherListItem } from "../../../models/IWeatherListItem";
import { IWeatherResponse } from "../../../models/IWeatherResponse";
import { WeatherService } from "../../../services/weatherService";

const WeatherWp = (props: IWeatherWpProps): JSX.Element => {
  const [locations, setLocations] = useState<IWeatherListItem[]>([]);
  const [weatherData, setWeatherData] = useState<IWeatherResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async (location: IWeatherListItem) => {
    try {
      setLoading(true);
      setError(null);
      const weatherService = new WeatherService(props.context.httpClient);
      const data = await weatherService.getWeather(
        location.Title,
        location.State
      );
      setWeatherData((prevData) => ({
        ...prevData,
        [location.Id]: data,
      }));
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getLocationListItems = useCallback(async (): Promise<void> => {
    if (!props.context) {
      return;
    }

    try {
      const _sp = getSP(props.context);
      const locations = await _sp.web.lists
        .getByTitle("East")
        .items.select("Id", "Title", "State")();
      setLocations(
        locations.map((location) => ({
          Id: location.Id,
          Title: location.Title,
          State: location.State,
        }))
      );
    } catch (error) {
      console.error(error);
    }
  }, [props.context]);

  useEffect(() => {
    void getLocationListItems();
  }, [getLocationListItems]);

  const renderWeatherInfo = (locationId: number): JSX.Element => {
    const isLoading = loading[locationId];
    const weather = weatherData[locationId];

    if (isLoading) {
      return <div>Loading weather data...</div>;
    }

    if (!weather) {
      return <div>Click to load weather information</div>;
    }

    return (
      <div className="weather-container">
        <h3>{weather.name} Weather</h3>
        <div className="weather-details">
          <div className="weather-main">
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
            <div>
              <div className="temperature">
                {Math.round(weather.main.temp)}°F
              </div>
              <div className="description">
                {weather.weather[0].description}
              </div>
            </div>
          </div>
          <div className="weather-info">
            <div>Feels like: {Math.round(weather.main.feels_like)}°F</div>
            <div>Humidity: {weather.main.humidity}%</div>
            <div>Wind: {Math.round(weather.wind.speed)} mph</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {locations.map((location) => (
        <Accordion
          key={location.Id}
          title={`${location.Title}, ${location.State}`}
          defaultCollapsed={true}
        >
          {renderWeatherInfo(location.Id)}
        </Accordion>
      ))}
    </>
  );
};

export default WeatherWp;
