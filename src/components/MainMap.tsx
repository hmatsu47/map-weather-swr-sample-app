import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { Marker as LeafletMarker, DivIcon, LatLng, Map } from "leaflet";
import "leaflet/dist/leaflet.css";
import { DisplayWeather } from "./DisplayWeather";
import { preloadAddress } from "../api/handleAddress";
import { preloadMuniJs } from "../api/handleMuniJs";
import { preloadWeatherData } from "../api/handleWeatherData";
import "./Map.css";

export function MainMap() {
  // 初期表示時、地図の中心を名古屋に
  const position = new LatLng(35.1815, 136.9064);
  const zoom = 13;
  const [map, setMap] = useState<Map | null>(null);
  // 地図の中心（十字マーク）
  const [mark, setMark] = useState<LeafletMarker<DivIcon> | null>(null);
  const cross = new DivIcon({ className: "cross", bgPos: [18, 18] });
  // API先読み
  preloadMuniJs();
  preloadAddress(position);
  preloadWeatherData(position);
  // 生成した地図のrefからsetMapできるように（生成した地図はメモ化）
  const displayMap = useMemo(
    () => (
      <MapContainer center={position} zoom={zoom} ref={setMap}>
        <TileLayer
          attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
          url="https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
        />
        <Marker
          position={position}
          icon={cross}
          zIndexOffset={100}
          interactive={true}
          ref={setMark}
        />
      </MapContainer>
    ),
    []
  );
  // 十字マークを地図の中心に表示し続ける（mousemoveイベントでマーカを移動）
  const onMove = useCallback(() => {
    mark!.setLatLng(map!.getCenter());
  }, [map, mark]);
  // 地図のドラッグ／移動イベントに対する呼び出しをセット／アンセット
  useEffect(() => {
    if (!map || !mark) {
      return;
    }
    map.on("move", onMove);
    // DOMアンマウント時にアンセット
    return () => {
      map.off("move", onMove);
    };
  }, [map, mark, onMove]);

  if (!map) {
    return (
      <div>
        <p>Loading...</p>
        {displayMap}
      </div>
    );
  }
  return (
    <div>
      <DisplayWeather map={map} />
      {displayMap}
    </div>
  );
}
