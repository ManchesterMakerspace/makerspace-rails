import axios from "axios";
import { RentalQueryParams, Rental } from "app/entities/rental";
import { buildRentalsUrl, buildRentalUrl } from "api/rentals/utils";
import { handleApiError } from "api/utils/handleApiError";

export const getRentals = async (isUserAdmin: boolean, queryParams?: RentalQueryParams) => {
  try {
    return await axios.get(buildRentalsUrl(isUserAdmin), { params: (queryParams) });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const postRentals = async (rentalForm: Rental) => {
  try {
    return await axios.post(buildRentalsUrl(true), { rental: rentalForm });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};


export const putRental = async (rentalId: string, rentalForm: Partial<Rental>) => {
  try {
    return await axios.put(buildRentalUrl(rentalId), { rental: rentalForm });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};

export const deleteRental = async (rentalId: string) => {
  try {
    return await axios.delete(buildRentalUrl(rentalId));
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};