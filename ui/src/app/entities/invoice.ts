import { QueryParams } from "app/interfaces";
import {Invoice as ApiInvoice, InvoiceableResource } from "makerspace-ts-api-client";

export interface MemberInvoice extends Omit<ApiInvoice, "rental"> {}

export interface RentalInvoice extends ApiInvoice {}

export type Invoice = MemberInvoice | RentalInvoice;
export const isMemberInvoice = (item: any): item is MemberInvoice => {
  return item && !!item.member && !item.rental;
}

export enum InvoiceOperation {
  Renew = "renew"
}

export const InvoiceableResourceDisplay = {
  [InvoiceableResource.Member]: "Membership",
  [InvoiceableResource.Rental]: "Rental",
}

export enum Properties {
  Id = "id",
  Name = "name",
  Description = "description",
  Contact = "contact",
  CreatedAt = "createdAt",
  DueDate = "dueDate",
  Amount = "amount",
  Quantity = "quantity",
  Settled = "settled",
  PastDue = "pastDue",
  ResourceId = "resourceId",
  ResourceClass = "resourceClass",
  MemberId = "memberId",
  SubscriptionId = "subscriptionId",
  PlanId = "planId",
  Disabled = "disabled",
  DiscountId = "discountId",
  IsPromotion = "isPromotion"
}



export interface InvoiceQueryParams extends QueryParams {
  [Properties.ResourceId]?: string[];
}

export interface InvoiceOptionQueryParams extends QueryParams {
  types: InvoiceableResource[];
  subscriptionOnly?: boolean;
}