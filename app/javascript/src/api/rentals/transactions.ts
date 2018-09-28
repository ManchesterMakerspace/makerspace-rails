import axios from "axios";
import { handleApiError } from "app/utils";
import { RentalQueryParams } from "app/entities/rental";
import { buildRentalsUrl } from "api/rentals/utils";

export const getRentals = async (isUserAdmin: boolean, queryParams?: RentalQueryParams) => {
  try {
    return await axios.get(buildRentalsUrl(isUserAdmin), { params: queryParams });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}