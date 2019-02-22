import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";

export const buildRentalsUrl = (admin: boolean = false): string => {
  return buildJsonUrl(admin ? Url.Admin.Rentals : Url.Rentals);
}

export const buildRentalUrl = (rentalId: string) => {
  return buildJsonUrl(buildRentalPath(rentalId));
}

const buildRentalPath = (rentalId: string) => {
  return Url.Admin.Rental.replace(Url.PathPlaceholder.RentalId, rentalId);
}
