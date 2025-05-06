import { QueryParams } from "app/interfaces";

export enum TransactionStatus {
  Settled = "settled",
  Failed = "failed",
  Declined = "processor_declined",
  Rejected = "gateway_rejected",
  Voided = "voided",
  Unknown = "unrecognized"
}

export enum TransactionSearchCriteria {
  Member = "member",
  Subscription = "subscription"
}
export interface TransactionQueryParams extends QueryParams {
  searchBy?: TransactionSearchCriteria;
  searchId?: string;
  startDate?: Date;
  endDate?: Date;
}