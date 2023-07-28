import { getApiData } from "./apiHandler";
import { LatLng } from "leaflet";
import { Address, AddressResult } from "../type";

export function fetchAddressUrl(position: LatLng) {
  return `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${position.lat}&lon=${position.lng}`;
}
export const fetchAddress = async (url: string): Promise<Address> => {
  const data: AddressResult = await getApiData(url);
  const address = { muniCd: data.results.muniCd, lv01Nm: data.results.lv01Nm };
  return address;
};
