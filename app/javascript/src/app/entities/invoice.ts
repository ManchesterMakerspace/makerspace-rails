import { QueryParams } from "app/interfaces";

interface BaseInvoice {
  id: string;
  name: string;
  description: string;
  settled: boolean;
  pastDue: boolean;
  createdAt: string;
  dueDate: string;
  amount: number;
  memberId: string;
  memberName: string;
  refunded: boolean;
  refundRequested?: Date;
  subscriptionId?: string;
  transactionId?: string;
  discountId?: string;
}

export interface Invoice extends BaseInvoice {
  resourceClass: InvoiceableResource;
  operation: InvoiceOperation,
  resourceId: string;
  quantity: number;
}

export interface InvoiceOption {
  id: string;
  name: string;
  description: string;
  amount: number;
  quantity: number;
  operation: InvoiceOperation,
  resourceClass: InvoiceableResource;
  planId: string;
  disabled: boolean;
  discountId: string;
}

export interface InvoiceOptionSelection {
  invoiceOptionId: string;
  discountId: string;
}

export const isInvoiceOptionSelection = (item: any): item is InvoiceOptionSelection => !!item.invoiceOptionId;


export enum InvoiceOperation {
  Renew = "renew"
}

export enum InvoiceableResource {
  Membership = "member",
  Rental = "rental",
}

export const InvoiceableResourceDisplay = {
  [InvoiceableResource.Membership]: "Membership",
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
  Operation = "operation",
  Settled = "settled",
  PastDue = "pastDue",
  ResourceId = "resourceId",
  ResourceClass = "resourceClass",
  MemberId = "memberId",
  SubscriptionId = "subscriptionId",
  PlanId = "planId",
  Disabled = "disabled",
  DiscountId = "discountId",
}



export interface InvoiceQueryParams extends QueryParams {
  [Properties.ResourceId]?: string;
}
