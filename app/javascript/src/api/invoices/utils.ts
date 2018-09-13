import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";

export const buildInvoicesUrl = (admin: boolean = false): string => {
  return buildJsonUrl(admin ? Url.Admin.Invoices : Url.Invoices);
}

export const buildInvoiceUrl = (invoiceId: string) => {
  return buildJsonUrl(buildInvoicePath(invoiceId));
}

const buildInvoicePath = (invoiceId: string) => {
  return Url.Admin.Invoice.replace(Url.PathPlaceholder.InvoiceId, invoiceId);
}