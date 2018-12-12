import { QueryParams } from "app/interfaces";

export interface Rental {
  id: string;
  number: string;
  description: string;
  expiration: number;
  memberId: string;
  memberName: string;
  subscriptionId?: string;
}

export enum Properties {
  Id = "id",
  Number = "number",
  Description = "description",
  Expiration = "expiration",
  MemberId = "memberId",
  MemberName = "memberName",
  SubscriptionId = "subscriptionId",
}
export interface RentalQueryParams extends QueryParams {
  [Properties.MemberId]: string;
}

export const isRental = (entity: any): entity is Rental => entity.hasOwnProperty(Properties.Expiration) && entity.hasOwnProperty(Properties.Number);