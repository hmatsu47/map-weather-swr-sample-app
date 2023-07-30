import useSWR, { preload } from "swr";
import { getTextFile } from "./textFileHandler";
import { Dictionary } from "../type";

// 国土交通省の市区町村コード変換用ファイル（https://maps.gsi.go.jp/js/muni.js）を読み込んで連想配列化
const readMuniJsUrl = "https://maps.gsi.go.jp/js/muni.js";
const readMuniJs = async (url: string): Promise<Dictionary> => {
  const data: string = await getTextFile(url);
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

export function useMuniJs() {
  const { data } = useSWR<Dictionary>(readMuniJsUrl, readMuniJs, {
    revalidateIfStale: false,
    loadingTimeout: 10000,
  });
  return data;
}

export function preloadMuniJs() {
  preload(readMuniJsUrl, readMuniJs);
}
