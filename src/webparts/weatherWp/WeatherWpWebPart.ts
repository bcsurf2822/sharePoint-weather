import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IReadonlyTheme } from "@microsoft/sp-component-base";

import { DynamicProperty } from "@microsoft/sp-component-base";
import { DynamicDataProvider } from "@microsoft/sp-dynamic-data";

import * as strings from "WeatherWpWebPartStrings";
import WeatherWp from "./components/WeatherWp";
import { IWeatherWpProps } from "./components/IWeatherWpProps";

export interface IWeatherWpWebPartProps {
  description: string;
  title: string;
}

export default class WeatherWpWebPart extends BaseClientSideWebPart<IWeatherWpWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = "";
  private _dynamicDataProvider: DynamicDataProvider | undefined;

  private readonly _providerSourceId =
    "7c3fd91e-c64b-4f92-8795-02317e1ca9a5-CitiesProvider";
  private readonly _propertyIdToWatch = "citiesUpdated";

  private _refreshTrigger: number = 0;

  protected onInit(): Promise<void> {
    this._dynamicDataProvider = new DynamicDataProvider(this.context);

    // Register for notifications when the component initializes
    this._registerForNotifications();

    return this._getEnvironmentMessage().then((message) => {
      this._environmentMessage = message;
    });
  }

  private _registerForNotifications(): void {
    if (!this._dynamicDataProvider) {
      return;
    }
    // Register interest in changes to the 'citiesUpdated' property from our specific source
    // The framework will call _handleNotification when the provider notifies
    this._dynamicDataProvider.registerPropertyChanged(
      this._providerSourceId, // Source ID of the Provider web part
      this._propertyIdToWatch, // Property ID we care about
      this._handleNotification // The function to call when notified
    );
    console.log(
      `Consumer registered for notifications from ${this._providerSourceId} for property ${this._propertyIdToWatch}`
    );
  }

  private _handleNotification = (): void => {
    console.log(
      `Consumer received notification for ${this._propertyIdToWatch}!`
    );

    // Increment the trigger value. This change needs to be passed to React.
    this._refreshTrigger++;

    // Re-render the React component tree.
    // This will pass the new _refreshTrigger value down as a prop.
    this.render();

    // Note: We could also try fetching the actual property value here if needed
    // const value = this._dynamicDataProvider.getPropertyValue(this._providerSourceId, this._propertyIdToWatch);
    // console.log("Current value from provider:", value);
  };

  public render(): void {
    const element: React.ReactElement<IWeatherWpProps> = React.createElement(
      WeatherWp,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        context: this.context,
        title: this.properties.title,
        refreshTrigger: this._refreshTrigger,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app
        .getContext()
        .then((context) => {
          let environmentMessage: string = "";
          switch (context.app.host.name) {
            case "Office": // running in Office
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentOffice
                : strings.AppOfficeEnvironment;
              break;
            case "Outlook": // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentOutlook
                : strings.AppOutlookEnvironment;
              break;
            case "Teams": // running in Teams
            case "TeamsModern":
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentTeams
                : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(
      this.context.isServedFromLocalhost
        ? strings.AppLocalEnvironmentSharePoint
        : strings.AppSharePointEnvironment
    );
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty(
        "--bodyText",
        semanticColors.bodyText || null
      );
      this.domElement.style.setProperty("--link", semanticColors.link || null);
      this.domElement.style.setProperty(
        "--linkHovered",
        semanticColors.linkHovered || null
      );
    }
  }

  protected onDispose(): void {
    if (this._dynamicDataProvider) {
      console.log("Consumer unregistering from dynamic data provider.");
      this._dynamicDataProvider.unregister(
        this._providerSourceId,
        this._propertyIdToWatch,
        this._handleNotification
      );
    }

    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
