import * as React from "react";
import type { IWeatherWpProps } from "./IWeatherWpProps";
import { getSP } from "../../../pnpjsConfig";
import { useState, useCallback, useEffect } from "react";

import { IWeatherListItem } from "../../../models/IWeatherListItem";
import LocationWeather from "./LocationWeather";
import { ListItemPicker } from "@pnp/spfx-controls-react/lib/ListItemPicker";

const WeatherWp = (props: IWeatherWpProps): JSX.Element => {
  const [locations, setLocations] = useState<IWeatherListItem[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<IWeatherListItem | null>(null);

  const getLocationListItems = useCallback(async (): Promise<void> => {
    if (!props.context) return;

    try {
      const _sp = getSP(props.context);

      const fetchedLocations = await _sp.web.lists
        .getByTitle("Cities")
        .items.select("Id", "City", "State")();
      console.log("SharePoint data:", fetchedLocations);

      const mappedLocations = fetchedLocations.map((location) => ({
        Id: location.Id,
        City: location.City,
        State: location.State,
      }));
      setLocations(mappedLocations);
    } catch (error) {
      console.error(error);
    }
  }, [props.context]);

  useEffect(() => {
    void getLocationListItems();
  }, [getLocationListItems]);

  const onSelectedItem = (
    pickerData: { key: string | number; name: string }[]
  ) => {
    console.log("Data from picker:", pickerData);
    if (pickerData.length > 0) {
      console.log("Type of selectedItem.key:", typeof pickerData[0].key);
    }

    if (pickerData && pickerData.length > 0) {
      const selectedItem = pickerData[0];
      const foundLocation = locations.find(
        (loc: IWeatherListItem) => loc.Id === Number(selectedItem.key)
      );

      if (foundLocation) {
        console.log("Found matching location:", foundLocation);
        setSelectedLocation(foundLocation);
      } else {
        console.log(
          "No matching location found in state for key:",
          selectedItem.key
        );
        setSelectedLocation(null);
      }
    } else {
      console.log("No item selected in picker.");
      setSelectedLocation(null);
    }
  };

  return (
    <>
      <ListItemPicker
        listId="a357ebbd-d75d-4512-8a03-0d7b7c133fdc"
        columnInternalName="Title"
        keyColumnInternalName="Id"
        placeholder="Select Location"
        itemLimit={1}
        onSelectedItem={onSelectedItem}
        context={props.context}
        enableDefaultSuggestions={true}
      />

      {selectedLocation && (
        <LocationWeather
          key={selectedLocation.Id}
          location={selectedLocation}
          httpClient={props.context.httpClient}
        />
      )}
      {!selectedLocation && (
        <p>Please select a location from the dropdown above.</p>
      )}
    </>
  );
};

export default WeatherWp;
