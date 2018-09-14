import { RequestStatus, CollectionOf } from "app/interfaces";
import { Invoice } from "app/entities/invoice";

export interface InvoicesState {
  entities: CollectionOf<Invoice>;
  read: RequestStatus & {
    totalItems: number;
  };
  create: RequestStatus;
}