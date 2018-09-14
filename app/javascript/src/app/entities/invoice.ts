import { QueryParams } from "app/interfaces";

export interface Invoice {
  id: string;
  description: string;
  notes: string;
  contact: string;
  items: InvoiceItem[];
  created_at: string;
  due_date: string;
  amount: number;
  settled?: boolean;
  past_due?: boolean;
  memberId?: string;
}

export interface InvoiceItem {
  resource: InvoiceableResource,
}

export enum InvoiceableResource {
  Member = "member",
  Rental = "rental",
}

export enum Properties {
  Id = "id",
  Description = "description",
  Notes = "notes",
  Contact = "contact",
  Items = "items",
  CreatedAt = "created_at",
  DueDate = "due_date",
  Amount = "amount",
  Settled = "settled",
  PastDue = "Past Due",
  MemberId = "memberId",
}

export interface InvoiceQueryParams extends QueryParams {
  [Properties.MemberId]: string;
}
