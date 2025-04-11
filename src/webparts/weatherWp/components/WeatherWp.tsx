import * as React from "react";
import type { IWeatherWpProps } from "./IWeatherWpProps";
import { getSP } from "../../../pnpjsConfig";
import { useState, useCallback, useEffect } from "react";

import { IWeatherListItem } from "../../../models/IWeatherListItem";
import LocationWeather from "./LocationWeather";
import { ListItemPicker } from "@pnp/spfx-controls-react/lib/ListItemPicker";
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner";
import { Text } from "@fluentui/react/lib/Text";

const WeatherWp = (props: IWeatherWpProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [locations, setLocations] = useState<IWeatherListItem[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<IWeatherListItem | null>(null);

  const getLocationListItems = useCallback(async (): Promise<void> => {
    if (!props.context) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
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
      console.error("Failed to get location list items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [props.context]);

  useEffect(() => {
    console.log(
      `WeatherWp: useEffect fetching locations. Trigger value: ${props.refreshTrigger}`
    );
    void getLocationListItems();
  }, [getLocationListItems, props.refreshTrigger]);

  const onSelectedItem = (
    pickerData: { key: string | number; name: string }[]
  ) => {
    console.log("Data from picker:", pickerData);
    console.log("Current locations state:", JSON.stringify(locations));

    if (locations.length === 0) {
      console.warn(
        "onSelectedItem called while locations state is empty. Loading state:",
        isLoading
      );

      return;
    }

    if (pickerData && pickerData.length > 0) {
      const selectedItem = pickerData[0];
      console.log(
        "Attempting to find key:",
        selectedItem.key,
        "Type:",
        typeof selectedItem.key
      );

      const keyAsNumber = Number(selectedItem.key);
      if (isNaN(keyAsNumber)) {
        console.error("Selected key is not a valid number:", selectedItem.key);
        setSelectedLocation(null);
        return;
      }

      const foundLocation = locations.find(
        (loc: IWeatherListItem) => loc.Id === keyAsNumber
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
      console.log("No item selected in picker or selection cleared.");
      setSelectedLocation(null);
    }
  };

  return (
    <>
      {!isLoading && !selectedLocation && (
        <Text
          variant="large"
          block
          styles={{ root: { marginBottom: 20, color: "#000000" } }}
        >
          Select a location to view weather information
        </Text>
      )}

      {isLoading && (
        <Spinner size={SpinnerSize.medium} label="Loading locations..." />
      )}

      <ListItemPicker
        listId="a357ebbd-d75d-4512-8a03-0d7b7c133fdc"
        columnInternalName="Title"
        keyColumnInternalName="Id"
        placeholder={isLoading ? "Loading..." : "Select Location"}
        itemLimit={1}
        onSelectedItem={onSelectedItem}
        context={props.context}
        enableDefaultSuggestions={true}
        disabled={isLoading}
      />

      {!isLoading && selectedLocation && (
        <LocationWeather
          key={selectedLocation.Id}
          location={selectedLocation}
          httpClient={props.context.httpClient}
        />
      )}
    </>
  );
};

export default WeatherWp;
