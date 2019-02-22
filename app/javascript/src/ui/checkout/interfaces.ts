import { RequestStatus } from "app/interfaces";
import { Invoice } from "app/entities/invoice";
import { CollectionOf } from "app/interfaces";

export interface CheckoutState extends RequestStatus {
  invoices: CollectionOf<Invoice>;
  transactions: CollectionOf<RequestStatus>;
}