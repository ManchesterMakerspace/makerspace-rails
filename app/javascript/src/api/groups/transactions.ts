import axios from "axios";
import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";
import { QueryParams } from "app/interfaces";
import { encodeQueryParams } from "api/utils/encodeQueryParams";
import { handleApiError } from "api/utils/handleApiError";

export const getGroups = async (queryParams?: QueryParams) => {
  try {
    return await axios.get(buildJsonUrl(Url.Groups), { params: encodeQueryParams(queryParams) });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};