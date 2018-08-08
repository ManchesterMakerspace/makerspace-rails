import axios from "axios";
import { buildJsonUrl, handleApiError } from "app/utils";
import { Url } from "app/constants";
import { QueryParams } from "app/interfaces";

export const getMembers = async (queryParams?: QueryParams) => {
  try {
    return await axios.get(buildJsonUrl(Url.Members), { params: queryParams });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}