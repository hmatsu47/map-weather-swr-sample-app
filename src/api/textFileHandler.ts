import { fetchWithTimeout } from "./fetchWithTimeout";

// API からデータ取得（GET）
export const getTextFile = async (url: string) => {
  return await (await fetchWithTimeout("GET", url)).text();
};
