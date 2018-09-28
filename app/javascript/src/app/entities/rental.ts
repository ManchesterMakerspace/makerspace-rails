import { QueryParams } from "app/interfaces";

export interface Rental {
  id: string;
  number: string;
  expiration: number;
  member: string;
  memberId: string;
}

export enum Properties {
  Id = "id",
  Number = "number",
  Expiration = "expiration",
  Member = "member",
  MemberId = "memberId",
}
export interface RentalQueryParams extends QueryParams {
  [Properties.MemberId]: string;
}
