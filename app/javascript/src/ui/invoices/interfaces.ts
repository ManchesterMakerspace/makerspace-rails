import { RequestStatus, CollectionOf } from "app/interfaces";
import { Invoice, InvoiceOption } from "app/entities/invoice";

export interface InvoicesState {
  entities: CollectionOf<Invoice>;
  invoiceOptions: {
    membership: CollectionOf<InvoiceOption>;
    rentals: CollectionOf<InvoiceOption>;
  }
  read: RequestStatus & {
    totalItems: number;
  };
  create: RequestStatus;
  options: RequestStatus;
}