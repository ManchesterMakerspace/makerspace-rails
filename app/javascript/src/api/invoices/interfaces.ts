import { QueryParams } from "app/interfaces";
import { InvoiceableResource } from "app/entities/invoice";

export interface InvoiceOptionQueryParams extends QueryParams {
  types: InvoiceableResource[];
  subscriptionOnly?: boolean;
}