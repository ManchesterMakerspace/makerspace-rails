import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";
import { Invoice, ApiInvoice, InvoiceOperation, InvoiceableResource } from "app/entities/invoice";

export const buildInvoicesUrl = (admin: boolean = false): string => {
  return buildJsonUrl(admin ? Url.Admin.Invoices : Url.Invoices);
}

export const buildInvoiceUrl = (invoiceId: string) => {
  return buildJsonUrl(buildInvoicePath(invoiceId));
}
export const buildInvoiceOptionsUrl = () => {
  return buildJsonUrl(Url.InvoiceOptions)
}

const buildInvoicePath = (invoiceId: string) => {
  return Url.Admin.Invoice.replace(Url.PathPlaceholder.InvoiceId, invoiceId);
}
