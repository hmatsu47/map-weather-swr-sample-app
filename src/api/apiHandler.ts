// API からデータ取得（GET）
export const getApiData = async (url: string) => {
  return await (await fetch(url)).json();
};
