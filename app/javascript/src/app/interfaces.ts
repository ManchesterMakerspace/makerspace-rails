import { AxiosRequestConfig, AxiosResponse } from "axios";
import { SortDirection } from "ui/common/table/constants";

export interface CollectionOf<T> {
  [key: string]: T;
}

export interface RequestStatus {
  isRequesting: boolean;
  error: string;
}

export interface QueryParams extends AxiosRequestConfig {
  pageNum?: number;
  order: SortDirection;
  orderBy: string;
  search?: string;
  filter?: {
    property: string;
    criteria: string;
  }
}

export interface ApiErrorResponse {
  errorMessage?: string;
  response: AxiosResponse
}