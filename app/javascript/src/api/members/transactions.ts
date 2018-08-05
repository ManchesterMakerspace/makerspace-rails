import axios from "axios";
import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";

export const getMembers = (queryParams?) => {
  return axios.get(buildJsonUrl(Url.membersPath), queryParams);
}