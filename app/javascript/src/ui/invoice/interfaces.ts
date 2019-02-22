import { RequestStatus } from "app/interfaces";
import { Invoice } from "app/entities/invoice";

export interface InvoiceState {
  entity: Invoice;
  stagedEntity: Partial<Invoice>;
  read: RequestStatus;
  update: RequestStatus;
  delete: RequestStatus;
}