import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";

export const buildRentalsUrl = (admin: boolean = false): string => {
  return buildJsonUrl(admin ? Url.Admin.Rentals : Url.Rentals);
}