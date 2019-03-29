import { QueryParams } from "app/interfaces";

export enum TransactionSearchCriteria {
  Member = "member",
  Subscription = "subscription",
}
export interface TransactionQueryParams extends QueryParams {
  searchBy?: TransactionSearchCriteria,
  searchId?: string,
  startDate?: Date;
  endDate?: Date;
}