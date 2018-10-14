import { QueryParams } from "app/interfaces";
import { InvoiceOptionTypes } from "api/invoices/constants";

export interface MembershipOptionQueryParams extends QueryParams {
  types: InvoiceOptionTypes[]
}