import { QueryParams } from "app/interfaces";

export interface Rental {
  id: string;
  number: string;
  description: string;
  expiration: number;
  memberId: string;
  memberName: string;
}

export enum Properties {
  Id = "id",
  Number = "number",
  Description = "description",
  Expiration = "expiration",
  MemberId = "memberId",
  MemberName = "memberName",
}
export interface RentalQueryParams extends QueryParams {
  [Properties.MemberId]: string;
}
