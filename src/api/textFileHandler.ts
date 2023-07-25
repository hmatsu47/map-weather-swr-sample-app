// テキストファイル取得（GET）
export const getTextFile = async (url: string) => {
  return await (await fetch(url)).text();
};
