import { QueryParams } from "app/interfaces";

interface BaseInvoice {
  id: string;
  description: string;
  notes: string;
  contact: string;
  createdAt: string;
  dueDate: string;
  amount: number;
  discount: boolean;
  settled?: boolean;
  pastDue?: boolean;
  resourceId: string;
  memberId: string;
}

export interface ApiInvoice extends BaseInvoice {
  operationString: string;
}

export interface Invoice extends BaseInvoice {
  resource: InvoiceableResource;
  operation: InvoiceOperation,
  value: string | number;
}

export interface InvoiceOption {
  id: string;
  description: string;
  amount: number;
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
  Description = "description",
  Notes = "notes",
  Contact = "contact",
  CreatedAt = "created_at",
  DueDate = "due_date",
  Amount = "amount",
  Settled = "settled",
  PastDue = "Past Due",
  ResourceId = "resourceId",
}

export enum PaymentMethod {
  PayPal = "paypal",
  Cash = "cash",
  CreditCard = "cc",
}

export interface InvoiceQueryParams extends QueryParams {
  [Properties.ResourceId]: string;
}
