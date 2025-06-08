import { ApiErrorResponse, ApiDataResponse } from "makerspace-ts-api-client";

export interface TransactionState<T> {
  isRequesting: boolean;
  error: string;
  response: ApiErrorResponse | ApiDataResponse<T>;
  data: T;
}

export type ApiFunction<Args, Data> = (params: Args) => Promise<ApiErrorResponse | ApiDataResponse<Data>>;
