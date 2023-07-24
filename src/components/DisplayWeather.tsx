import { useCallback, useEffect, useState } from "react";
import { useDidMount } from "rooks";
import { LatLng, Map } from "leaflet";
import { fetchAddress } from "../api/fetchAddress";
import { fetchWeatherData } from "../api/fetchWeatherData";
import { readMuniJs } from "../api/readMuniJs";
import { getWeatherIcon, getWeatherItem, getWindDirectionName } from "../utils/weatherUtil";
import { Dictionary } from "../type";

type Props = {
  map: Map;
};

export function DisplayWeather(props: Props) {
  const map = props.map;
  // 地図の中心座標（緯度・軽度）
  const [position, setPosition] = useState(() => map.getCenter());
  // 市区町村コード→市区町村（名）変換辞書（国土交通省のmuni.jsを連想配列化）
  const [muniDict, setMuniDict] = useState<Dictionary | null>(null);
  // 現在地の住所
  const [addressMuniCode, setAddressMuniCode] = useState<string | null>(null);
  const [addressDetail, setAddressDetail] = useState<string | null>(null);
  // 現在天気の表示項目
  const [weatherCode, setWeatherCode] = useState<number | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [windSpeed, setWindSpeed] = useState<number | null>(null);
  const [windDirection, setWindDirection] = useState<number | null>(null);
  // 地図のドラッグ／移動完了時に地図の中心座標を更新
  const onMoveEnd = useCallback(() => {
    setPosition(map.getCenter());
  }, [map]);
  // 地図のドラッグ／移動完了イベントに対する呼び出しをセット／アンセット
  useEffect(() => {
    map.on("moveend", onMoveEnd);
    // DOMアンマウント時にアンセット
    return () => {
      map.off("moveend", onMoveEnd);
    };
  }, [map, onMoveEnd]);
  // 地図の中心座標が変更されたらその場所の住所を国土地理院のAPIで取得し、現在の天気をOpen-MeteoのAPIで取得
  useEffect(() => {
    const addressLoad = async () => {
      const address = await fetchAddress(position);
      setAddressMuniCode(address.muniCd);
      setAddressDetail(address.lv01Nm);
    };
    addressLoad();
    const weatherLoad = async () => {
      const weather = await fetchWeatherData(position);
      setWeatherCode(getWeatherItem(weather, weather?.weathercode));
      setTemperature(getWeatherItem(weather, weather?.temperature));
      setWindSpeed(getWeatherItem(weather, weather?.windspeed));
      setWindDirection(getWeatherItem(weather, weather?.winddirection));
    };
    weatherLoad();
  }, [position]);
  // 地図ロード時に市区町村コードファイルを取得
  useDidMount(async () => {
    const muni = await readMuniJs();
    setMuniDict(muni);
  });
  // ブラウザから取得した現在位置に地図の中心を移動
  function moveToCurrentPosition() {
    if (!("geolocation" in navigator) || !map) {
      // ブラウザから位置情報が取得できなければ何もしない
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const latLng = new LatLng(latitude, longitude);
      setPosition(latLng);
      map.panTo(latLng);
    });
  }

  return (
    <p>
      {/* 緯度: {position.lat.toFixed(4)}, 経度: {position.lng.toFixed(4)} ・{' '} */}
      {muniDict && addressMuniCode && addressDetail
        ? `${muniDict[addressMuniCode]}${addressDetail !== "－" ? addressDetail : ""}の`
        : ""}
      天気: {weatherCode !== null ? getWeatherIcon(weatherCode) || "--" : "--"} ・ 気温:{" "}
      {temperature !== null ? temperature.toFixed(1) || "-.-" : "-.-"} ℃ ・ 風:{" "}
      {windDirection !== null ? getWindDirectionName(windDirection) : ""}{" "}
      {windSpeed !== null ? windSpeed.toFixed(1) || "-.-" : "-.-"} m/s{" "}
      <input type="button" value={"現在地へ移動"} onClick={moveToCurrentPosition} />
    </p>
  );
}
