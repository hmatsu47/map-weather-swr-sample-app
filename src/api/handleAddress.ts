import useSWR, { preload } from "swr";
import { LatLng } from "leaflet";
import { getApiData } from "./apiHandler";
import { Address, AddressResult } from "../type";

function fetchAddressUrl(position: LatLng) {
  return `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${position.lat}&lon=${position.lng}`;
}
const fetchAddress = async (url: string): Promise<Address> => {
  const data: AddressResult = await getApiData(url);
  const address = { muniCd: data.results.muniCd, lv01Nm: data.results.lv01Nm };
  return address;
};

export function useAddress(position: LatLng) {
  const { data } = useSWR<Address>(fetchAddressUrl(position), fetchAddress, {
    loadingTimeout: 10000,
  });
  return data;
}

export function preloadAddress(position: LatLng) {
  preload(fetchAddressUrl(position), fetchAddress);
}
