import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";

export const buildInvoicesUrl = (admin: boolean = false): string => {
  return buildJsonUrl(admin ? Url.Admin.Invoices : Url.Invoices);
}

export const buildInvoiceUrl = (invoiceId: string) => {
  return buildJsonUrl(buildInvoicePath(invoiceId));
}

export const buildInvoiceOptionsUrl = (invoiceOptionId?: string, admin?: boolean) => {
  return buildJsonUrl(invoiceOptionId ? buildInvoiceOptionPath(invoiceOptionId) : (admin ? Url.Admin.InvoiceOptions : Url.InvoiceOptions));
}

const buildInvoiceOptionPath = (optionId: string) => {
  return Url.Admin.InvoiceOption.replace(Url.PathPlaceholder.InvoiceId, optionId);
}

const buildInvoicePath = (invoiceId: string) => {
  return Url.Admin.Invoice.replace(Url.PathPlaceholder.InvoiceId, invoiceId);
}
