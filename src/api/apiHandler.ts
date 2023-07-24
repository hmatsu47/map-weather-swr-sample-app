import { fetchWithTimeout } from "./fetchWithTimeout";

// API からデータ取得（GET）
export const getApiData = async (url: string) => {
  return await (await fetchWithTimeout("GET", url)).json();
};
