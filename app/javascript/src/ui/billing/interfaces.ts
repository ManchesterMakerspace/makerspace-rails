import { RequestStatus, CollectionOf } from "app/interfaces";
import { InvoiceOption, InvoiceOptionSelection } from "app/entities/invoice";

export interface BillingState {
  entities: CollectionOf<InvoiceOption>;
  selectedOption: InvoiceOptionSelection;
  read: RequestStatus & {
    totalItems: number;
  };
  create: RequestStatus;
  update: RequestStatus;
  delete: RequestStatus;
}
