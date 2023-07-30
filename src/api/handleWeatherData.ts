import useSWR, { preload } from "swr";
import { LatLng } from "leaflet";
import { getApiData } from "./apiHandler";
import { Weather, WeatherResult } from "../type";

function fetchWeatherDataUrl(position: LatLng) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${position.lat}&longitude=${position.lng}&current_weather=true&windspeed_unit=ms`;
}
const fetchWeatherData = async (url: string): Promise<Weather | null> => {
  const data: WeatherResult = await getApiData(url);
  const weather = data ? (data.current_weather ? data.current_weather : null) : null;
  return weather;
};

export function useWeatherData(position: LatLng) {
  const { data } = useSWR<Weather | null>(fetchWeatherDataUrl(position), fetchWeatherData, {
    loadingTimeout: 10000,
  });
  return data;
}

export function preloadWeatherData(position: LatLng) {
  preload(fetchWeatherDataUrl(position), fetchWeatherData);
}
