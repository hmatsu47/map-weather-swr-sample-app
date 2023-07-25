import { getApiData } from "../api/apiHandler";
import { LatLng } from "leaflet";
import { Weather, WeatherResult } from "../type";

export function fetchWeatherDataUrl(position: LatLng) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${position.lat}&longitude=${position.lng}&current_weather=true&windspeed_unit=ms`;
}
export const fetchWeatherData = async (url: string) => {
  const load = async (): Promise<Weather | null> => {
    const data: WeatherResult = await getApiData(url);
    const weather = data ? (data.current_weather ? data.current_weather : null) : null;
    return weather;
  };
  return load();
};
