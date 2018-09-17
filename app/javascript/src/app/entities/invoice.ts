import { QueryParams } from "app/interfaces";

export interface ApiInvoice {
  id: string;
  description: string;
  notes: string;
  contact: string;
  createdAt: string;
  dueDate: string;
  amount: number;
  settled?: boolean;
  pastDue?: boolean;
  resourceId: string;
  operationString: string;
}

export interface Invoice {
  id: string;
  description: string;
  notes: string;
  contact: string;
  createdAt: string;
  dueDate: string;
  amount: number;
  settled?: boolean;
  pastDue?: boolean;
  resourceId: string;
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

export interface InvoiceQueryParams extends QueryParams {
  [Properties.ResourceId]: string;
}
