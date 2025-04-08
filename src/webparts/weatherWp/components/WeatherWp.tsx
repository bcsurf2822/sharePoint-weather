import * as React from "react";
// import styles from "./WeatherWp.module.scss";
import type { IWeatherWpProps } from "./IWeatherWpProps";
import { getSP } from "../../../pnpjsConfig";
import { useState, useCallback, useEffect } from "react";
import { Accordion } from "@pnp/spfx-controls-react";
// import { escape } from "@microsoft/sp-lodash-subset";

interface IWeatherListItem {
  Id: number;
  Title: string;
  State: string;
}

const WeatherWp = (props: IWeatherWpProps): JSX.Element => {
  const [locations, setLocations] = useState<IWeatherListItem[]>([]);

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

  return (
    <>
      {locations.map((location) => (
        <Accordion
          key={location.Id}
          title={location.Title}
          defaultCollapsed={true}
        >
          {location.Title}, {location.State}
        </Accordion>
      ))}
    </>
  );
};

export default WeatherWp;
