import { HttpClient } from "@microsoft/sp-http";
import { IWeatherResponse } from "../models/IWeatherResponse";
import { IGeocodingResponse } from "../models/IGeocodeResponse";

export class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl: string = "https://api.openweathermap.org";

  constructor(private httpClient: HttpClient) {
    this.apiKey = process.env.SPFX_WEATHER_API_KEY || "";
    console.log(
      "WeatherService initialized with API Key:",
      this.apiKey ? "Present" : "Missing"
    );
  }

  public async getWeather(
    cityName: string,
    stateCode: string,
    countryCode: string = "us"
  ): Promise<IWeatherResponse> {
    const cityNameLower = cityName.toLowerCase();
    const stateCodeLower = stateCode.toLowerCase();

    const geoData = await this.getCoordinates(
      cityNameLower,
      stateCodeLower,
      countryCode
    );

    if (!geoData || geoData.length === 0) {
      throw new Error(
        `Location not found for ${cityName}, ${stateCode}, ${countryCode}`
      );
    }

    const { lat, lon } = geoData[0];
    return this.getWeatherByCoordinates(lat, lon);
  }

  private async getCoordinates(
    cityName: string,
    stateCode: string,
    countryCode: string
  ): Promise<IGeocodingResponse[]> {
    const url = `${this.baseUrl}/geo/1.0/direct?q=${cityName},${stateCode},${countryCode}&limit=1&appid=${this.apiKey}`;
    console.log("Making geocoding request to:", url);
    const response = await this.httpClient.get(
      url,
      HttpClient.configurations.v1
    );
    const data = await response.json();
    console.log("Geocoding response:", data);
    return data;
  }

  private async getWeatherByCoordinates(
    lat: number,
    lon: number
  ): Promise<IWeatherResponse> {
    const url = `${this.baseUrl}/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${this.apiKey}`;
    console.log("Making weather request to:", url);
    const response = await this.httpClient.get(
      url,
      HttpClient.configurations.v1
    );
    const data = await response.json();
    console.log("Weather response:", data);
    return data;
  }
}
