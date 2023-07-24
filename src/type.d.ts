export type Weather = {
  temperature?: number;
  windspeed?: number;
  winddirection?: number;
  weathercode?: number;
  time?: string;
};
export type WeatherResult = {
  latitude?: number;
  longitude?: number;
  generationtime_ms?: number;
  utc_offset_seconds?: number;
  timezone?: string;
  timezone_abbreviation?: string;
  elevation?: string;
  current_weather?: Weather;
  error?: boolean;
  reason?: string;
};
export type Address = {
  muniCd: string;
  lv01Nm: string;
};
export type AddressResult = {
  results: Address;
};
export type Dictionary = { [key: string]: string };
