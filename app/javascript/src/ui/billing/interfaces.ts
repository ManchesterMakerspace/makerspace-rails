import { RequestStatus, CollectionOf } from "app/interfaces";
import { InvoiceOption } from "app/entities/invoice";

export interface BillingState {
  entities: CollectionOf<InvoiceOption>;
  read: RequestStatus & {
    totalItems: number;
  };
  create: RequestStatus;
  update: RequestStatus;
  delete: RequestStatus;
}