import { ApiErrorResponse, ApiDataResponse } from "makerspace-ts-api-client";
const extractTotalItems = <T>(response: ApiErrorResponse | ApiDataResponse<T>): number => {
  return response && Number(response.response.headers.get("total-items"));
}

export default extractTotalItems;