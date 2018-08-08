import axios from "axios";
import { Url } from "app/constants";
import { buildJsonUrl, handleApiError } from "app/utils";
import { QueryParams } from "app/interfaces";

export const getRentals = async (queryParams?: QueryParams) => {
  try {
    return await axios.get(buildJsonUrl(Url.Rentals), { params: queryParams });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}