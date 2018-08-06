import axios from "axios";
import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";
import { QueryParams } from "app/interfaces";

export const getMembers = (queryParams?: QueryParams) => {
  return axios.get(buildJsonUrl(Url.membersPath), { params: queryParams });
}