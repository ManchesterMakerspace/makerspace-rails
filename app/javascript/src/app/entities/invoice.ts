import { QueryParams } from "app/interfaces";

interface BaseInvoice {
  id: string;
  name: string;
  description: string;
  contact: string;
  settled: boolean;
  pastDue: boolean;
  createdAt: string;
  dueDate: string;
  amount: number;
  memberId: string;
  subscriptionId?: string;
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
}


export enum InvoiceOperation {
  Renew = "renew"
}

export enum InvoiceableResource {
  Membership = "member",
  Rental = "rental",
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
}

export enum PaymentMethodType {
  PayPal = "paypal",
  Cash = "cash",
  CreditCard = "cc",
}

export interface InvoiceQueryParams extends QueryParams {
  [Properties.ResourceId]: string;
}
