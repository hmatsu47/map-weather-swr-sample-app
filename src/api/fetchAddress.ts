import { getApiData } from "./apiHandler";
import { LatLng } from "leaflet";
import { Address, AddressResult } from "../type";

export const fetchAddress = async (position: LatLng) => {
  const load = async (): Promise<Address> => {
    const data: AddressResult = await getApiData(
      `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${position.lat}&lon=${position.lng}`
    );
    const address = { muniCd: data.results.muniCd, lv01Nm: data.results.lv01Nm };
    return address;
  };
  return load();
};
