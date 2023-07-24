import { getApiData } from "../api/apiHandler";
import { LatLng } from "leaflet";
import { Weather, WeatherResult } from "../type";

export const fetchWeatherData = async (position: LatLng) => {
  const load = async (): Promise<Weather | null> => {
    const data: WeatherResult = await getApiData(
      `https://api.open-meteo.com/v1/forecast?latitude=${position.lat}&longitude=${position.lng}&current_weather=true&windspeed_unit=ms`
    );
    const weather = data ? (data.current_weather ? data.current_weather : null) : null;
    return weather;
  };
  return load();
};
