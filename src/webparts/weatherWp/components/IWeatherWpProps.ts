import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IWeatherWpProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
  title: string;
  refreshTrigger: number;
}
