import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { LatLng, Map } from "leaflet";
import { fetchAddress, fetchAddressUrl } from "../api/fetchAddress";
import { fetchWeatherData, fetchWeatherDataUrl } from "../api/fetchWeatherData";
import { readMuniJs, readMuniJsUrl } from "../api/readMuniJs";
import { getWeatherIcon, getWeatherItem, getWindDirectionName } from "../utils/weatherUtil";
import { Address, Dictionary, Weather } from "../type";

type Props = {
  map: Map;
};

export function DisplayWeather(props: Props) {
  const map = props.map;
  // 地図の中心座標（緯度・軽度）
  const [position, setPosition] = useState(() => map.getCenter());
  // 市区町村コード→市区町村（名）変換辞書（国土交通省のmuni.jsを連想配列化）
  const { data: muniDict } = useSWR<Dictionary>(readMuniJsUrl, readMuniJs, {
    revalidateIfStale: false,
    loadingTimeout: 10000,
  });
  // 現在地の住所
  const { data: address } = useSWR<Address>(fetchAddressUrl(position), fetchAddress, {
    loadingTimeout: 10000,
  });
  const [addressMuniCode, setAddressMuniCode] = useState<string | null>(null);
  const [addressDetail, setAddressDetail] = useState<string | null>(null);
  // 現在天気の表示項目
  const { data: weather } = useSWR<Weather | null>(
    fetchWeatherDataUrl(position),
    fetchWeatherData,
    { loadingTimeout: 10000 }
  );
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
    if (address) {
      setAddressMuniCode(address.muniCd);
      setAddressDetail(address.lv01Nm);
    }
  }, [address]);
  useEffect(() => {
    if (weather) {
      setWeatherCode(getWeatherItem(weather, weather?.weathercode));
      setTemperature(getWeatherItem(weather, weather?.temperature));
      setWindSpeed(getWeatherItem(weather, weather?.windspeed));
      setWindDirection(getWeatherItem(weather, weather?.winddirection));
    }
  }, [weather]);
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
