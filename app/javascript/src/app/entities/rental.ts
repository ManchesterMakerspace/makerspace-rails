import { QueryParams } from "app/interfaces";

export interface Rental {
  id: string;
  number: string;
  expiration: number;
  memberId: string;
}

export enum Properties {
  Id = "id",
  Number = "number",
  Expiration = "expiration",
  MemberId = "memberId",
}
export interface RentalQueryParams extends QueryParams {
  [Properties.MemberId]: string;
}
