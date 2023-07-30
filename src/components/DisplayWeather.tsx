import { useCallback, useEffect, useState } from "react";
import { LatLng, Map } from "leaflet";
import { useMuniJs } from "../api/handleMuniJs";
import { useAddress } from "../api/handleAddress";
import { useWeatherData } from "../api/handleWeatherData";
import { getWeatherIcon, getWeatherItem, getWindDirectionName } from "../utils/weatherUtil";

type Props = {
  map: Map;
};

export function DisplayWeather(props: Props) {
  const map = props.map;
  // 地図の中心座標（緯度・軽度）
  const [position, setPosition] = useState(() => map.getCenter());
  // 市区町村コード→市区町村（名）変換辞書（国土交通省のmuni.jsを連想配列化）
  const muniDict = useMuniJs();
  // 現在地の住所
  const address = useAddress(position);
  const [addressMuniCode, setAddressMuniCode] = useState<string | null>(null);
  const [addressDetail, setAddressDetail] = useState<string | null>(null);
  // 現在天気の表示項目
  const weather = useWeatherData(position);
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
  // 国土地理院のAPIからSWRで取得した住所が変わったらステートに反映
  useEffect(() => {
    if (address) {
      setAddressMuniCode(address.muniCd);
      setAddressDetail(address.lv01Nm);
    }
  }, [address]);
  // Open-MeteoのAPIからSWRで取得した気象情報が変わったらステートに反映
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
