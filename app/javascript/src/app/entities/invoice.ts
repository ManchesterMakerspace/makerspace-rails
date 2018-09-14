import { QueryParams } from "app/interfaces";

export interface ApiInvoice {
  id: string;
  description: string;
  notes: string;
  contact: string;
  created_at: string;
  due_date: string;
  amount: number;
  settled?: boolean;
  past_due?: boolean;
  resourceId: string;
  operation_string: string;
}

export interface Invoice {
  id: string;
  description: string;
  notes: string;
  contact: string;
  created_at: string;
  due_date: string;
  amount: number;
  settled?: boolean;
  past_due?: boolean;
  resourceId: string;
  resource: InvoiceableResource;
  operation: InvoiceOperation,
  value: string | number;
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

export interface InvoiceQueryParams extends QueryParams {
  [Properties.ResourceId]: string;
}
