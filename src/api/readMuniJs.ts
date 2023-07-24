import { getTextFile } from "./textFileHandler";
import { Dictionary } from "../type";

// 国土交通省の市区町村コード変換用ファイル（https://maps.gsi.go.jp/js/muni.js）を読み込んで連想配列化
export const readMuniJs = async () => {
  const load = async (): Promise<Dictionary> => {
    const data: string = await getTextFile("https://maps.gsi.go.jp/js/muni.js");
    const lines = data.split("\n");
    let dict: Dictionary = {};
    lines.forEach((line) => {
      const csvLine = line.split("'");
      if (csvLine.length === 3) {
        const csvValues = csvLine[1].split(",");
        if (csvValues.length === 4) {
          dict[csvValues[2].padStart(5, "0")] = csvValues[3].replace("　", "");
        }
      }
    });
    return dict;
  };
  return load();
};
