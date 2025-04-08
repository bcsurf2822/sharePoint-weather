import { IWeatherListItem } from "../../../models/IWeatherListItem";
import styles from "./LocationWeather.module.scss";
import * as React from "react";

const LocationWeather = ({ location }: { location: IWeatherListItem }) => {
  return (
    <div className={styles["location-weather"]}>
      <h2 className={styles["location-weather__title"]}>Location Details</h2>
      <p className={styles["location-weather__detail"]}>
        <span className={styles["location-weather__detail-label"]}>
          Location:
        </span>{" "}
        {location.Title}
      </p>
      <p className={styles["location-weather__detail"]}>
        <span className={styles["location-weather__detail-label"]}>State:</span>{" "}
        {location.State}
      </p>
    </div>
  );
};

export default LocationWeather;
