import { RequestStatus, CollectionOf } from "app/interfaces";
import { InvoiceOption } from "makerspace-ts-api-client";

export interface BillingState {
  entities: CollectionOf<InvoiceOption>;
  read: RequestStatus & {
    totalItems: number;
  };
  create: RequestStatus;
  update: RequestStatus;
  delete: RequestStatus;
}
