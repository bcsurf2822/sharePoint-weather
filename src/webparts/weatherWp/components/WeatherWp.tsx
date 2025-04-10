import * as React from "react";
import type { IWeatherWpProps } from "./IWeatherWpProps";
import { getSP } from "../../../pnpjsConfig";
import { useState, useCallback, useEffect } from "react";

import { IWeatherListItem } from "../../../models/IWeatherListItem";
import LocationWeather from "./LocationWeather";
import { ListItemPicker } from "@pnp/spfx-controls-react/lib/ListItemPicker";
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner"; // Import Spinner

const WeatherWp = (props: IWeatherWpProps): JSX.Element => {
  // Add a loading state, initially true
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [locations, setLocations] = useState<IWeatherListItem[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<IWeatherListItem | null>(null);

  const getLocationListItems = useCallback(async (): Promise<void> => {
    if (!props.context) {
      setIsLoading(false); // Stop loading if context is missing
      return;
    }

    // Ensure loading is true when starting fetch (though already set initially)
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
      // Consider setting locations to empty array on error?
      // setLocations([]);
    } finally {
      // *** IMPORTANT: Set loading to false AFTER data is set or an error occurs ***
      setIsLoading(false);
    }
  }, [props.context]); // Dependency array is correct

  useEffect(() => {
    void getLocationListItems();
    // Dependency array should include the function itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getLocationListItems]);

  const onSelectedItem = (
    pickerData: { key: string | number; name: string }[]
  ) => {
    console.log("Data from picker:", pickerData);
    console.log("Current locations state:", JSON.stringify(locations)); // Keep this for debugging

    // Basic check: If locations is empty, something is wrong (or loading hasn't finished)
    if (locations.length === 0) {
      console.warn(
        "onSelectedItem called while locations state is empty. Loading state:",
        isLoading
      );
      // Avoid proceeding if locations aren't loaded, even if picker wasn't disabled somehow
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
      // Handle case where picker returns empty data (e.g., selection cleared)
      console.log("No item selected in picker or selection cleared.");
      setSelectedLocation(null);
    }
  };

  return (
    <>
      {/* Optionally show a loading indicator */}
      {isLoading && (
        <Spinner size={SpinnerSize.medium} label="Loading locations..." />
      )}

      <ListItemPicker
        listId="a357ebbd-d75d-4512-8a03-0d7b7c133fdc"
        columnInternalName="Title" // Still recommend verifying this column vs. City/State data
        keyColumnInternalName="Id"
        placeholder={isLoading ? "Loading..." : "Select Location"} // Change placeholder while loading
        itemLimit={1}
        onSelectedItem={onSelectedItem}
        context={props.context}
        enableDefaultSuggestions={true}
        // *** Disable the picker while loading data ***
        disabled={isLoading}
      />

      {/* Weather display logic remains the same */}
      {!isLoading && selectedLocation && (
        <LocationWeather
          key={selectedLocation.Id}
          location={selectedLocation}
          httpClient={props.context.httpClient}
        />
      )}
      {!isLoading && !selectedLocation && (
        <p>Select a location to view weather information.</p>
      )}
    </>
  );
};

export default WeatherWp;
