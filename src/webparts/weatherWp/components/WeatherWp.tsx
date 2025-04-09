import * as React from "react";
// import styles from "./WeatherWp.module.scss";
import type { IWeatherWpProps } from "./IWeatherWpProps";
import { getSP } from "../../../pnpjsConfig";
import { useState, useCallback, useEffect } from "react";
import { Accordion, FieldPicker, ISPField } from "@pnp/spfx-controls-react";
import { IWeatherListItem } from "../../../models/IWeatherListItem";
import LocationWeather from "./LocationWeather";
import { FieldsOrderBy } from "@pnp/spfx-controls-react/lib/services/ISPService";
// import { IWeatherResponse } from "../../../models/IWeatherResponse";

const WeatherWp = (props: IWeatherWpProps): JSX.Element => {
  // const [weatherData, setWeatherData] = useState<IWeatherResponse[]>([]);
  // const [loading, setLoading] = useState<boolean>(false);
  const [locations, setLocations] = useState<IWeatherListItem[]>([]);
  const [selectedField, setSelectedField] = useState<ISPField | null>(null);
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

  const onFieldPickerChanged = (fields: ISPField | ISPField[]) => {
    console.log("Selected field:", fields);
    // If multiSelect is false, fields will be a single ISPField object
    setSelectedField(fields as ISPField);
  };

  if (selectedField) {
    console.log("Selected field:", selectedField);
  }

  return (
    <>
      <FieldPicker
        context={props.context}
        group="Content Feedback"
        includeHidden={false}
        includeReadOnly={false}
        label="Select your field(s)"
        multiSelect={false}
        orderBy={FieldsOrderBy.Title}
        listId="8ba652d3-3e3a-49d9-88f3-5d8720ba7359"
        onSelectionChanged={onFieldPickerChanged}
        showBlankOption={true}
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
