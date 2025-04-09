import * as React from "react";
// import styles from "./WeatherWp.module.scss";
import type { IWeatherWpProps } from "./IWeatherWpProps";
import { getSP } from "../../../pnpjsConfig";
import { useState, useCallback, useEffect } from "react";
import { Accordion } from "@pnp/spfx-controls-react";
import { IWeatherListItem } from "../../../models/IWeatherListItem";
import LocationWeather from "./LocationWeather";
import { ListItemPicker } from "@pnp/spfx-controls-react/lib/ListItemPicker";

// import { IWeatherResponse } from "../../../models/IWeatherResponse";

const WeatherWp = (props: IWeatherWpProps): JSX.Element => {
  // const [weatherData, setWeatherData] = useState<IWeatherResponse[]>([]);
  // const [loading, setLoading] = useState<boolean>(false);
  const [locations, setLocations] = useState<IWeatherListItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<
    { key: string; name: string; state: string }[]
  >([]);

  const getLocationListItems = useCallback(async (): Promise<void> => {
    if (!props.context) {
      return;
    }

    try {
      const _sp = getSP(props.context);

      const locations = await _sp.web.lists
        .getByTitle("East")
        .items.select("Id", "Title", "State")();
      console.log("Raw SharePoint data:", locations);
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

  const onSelectedItem = (
    data: { key: string; name: string; state: string }[]
  ) => {
    setSelectedItems(data);
    console.log("selectedItems", selectedItems);
    console.log("Selected items:", data);

    for (const item of data) {
      // Find the matching location from our locations array using traditional for loop
      for (let i = 0; i < locations.length; i++) {
        if (locations[i].Id.toString() === item.key) {
          console.log("Found matching location:", {
            Title: locations[i].Title,
            State: locations[i].State,
          });
          break; // Exit the loop once we found the match
        }
      }
    }
  };

  return (
    <>
      <ListItemPicker
        listId="8ba652d3-3e3a-49d9-88f3-5d8720ba7359"
        columnInternalName="Title"
        keyColumnInternalName="Id"
        placeholder="Select Location"
        itemLimit={1}
        onSelectedItem={onSelectedItem}
        context={props.context}
        enableDefaultSuggestions={true}
        filter="Id ne null"
      />
      {locations.map((location) => (
        <Accordion
          key={location.Id}
          title={`${location.Title}, ${location.State}`}
          defaultCollapsed={true}
        >
          <LocationWeather
            location={location}
            httpClient={props.context.httpClient}
          />
        </Accordion>
      ))}
    </>
  );
};

export default WeatherWp;
