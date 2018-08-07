import axios from "axios";
import { Url } from "app/constants";
import { buildJsonUrl } from "app/utils";
import { QueryParams } from "app/interfaces";

export const getPlans = (queryParams?: QueryParams) => {
  return axios.get(buildJsonUrl(Url.plansPath), { params: queryParams });
}