import { ApiErrorResponse, ApiDataResponse } from "makerspace-ts-api-client";

import generateUUID from "../utils/generateUUID";

type ApiFunction<Args, Resp> = (args: Args) => Promise<ApiErrorResponse | ApiDataResponse<Resp>>;

export const buildQueryString = <Args, Resp>(
  apiFunction: ApiFunction<Args, Resp>,
 ...args: Args[]
): string =>  {
  return `${apiFunction.name}:${JSON.stringify(args)}`;
};

export const buildTransactionString = <Args, Resp>(
  apiFunction: ApiFunction<Args, Resp>,
  ...args: Args[]
): string =>  `${apiFunction.name}-${generateUUID()}:${JSON.stringify(args)}`;