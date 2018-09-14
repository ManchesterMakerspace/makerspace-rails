import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";
import { Invoice, ApiInvoice, InvoiceOperation, InvoiceableResource } from "app/entities/invoice";

export const buildInvoicesUrl = (admin: boolean = false): string => {
  return buildJsonUrl(admin ? Url.Admin.Invoices : Url.Invoices);
}

export const buildInvoiceUrl = (invoiceId: string) => {
  return buildJsonUrl(buildInvoicePath(invoiceId));
}

const buildInvoicePath = (invoiceId: string) => {
  return Url.Admin.Invoice.replace(Url.PathPlaceholder.InvoiceId, invoiceId);
}

const regexTestExpression = /([\w]*)\.([\w]*)\s\=\s([\w\d])/;
export const parseApiInvoice = (invoice: ApiInvoice): Invoice => {
  const { operationString, ...rest } = invoice;
  if (regexTestExpression.test(operationString)) {
    const [operationPrefix, value] = operationString.split(" = ");
    const [resource, operation] = operationPrefix.split(".");

    if (!Object.values(InvoiceOperation).includes(operation)) {
      throw new Error("Invalid invoice operation");
    }
    if (!Object.values(InvoiceableResource).includes(resource)) {
      throw new Error("Invalid invoice resource");
    }

    return {
      ...rest,
      resource: resource as InvoiceableResource,
      operation: operation as InvoiceOperation,
      value,
    }
  } else {
    throw new Error("Invalid operation expression");
  }
}

export const constructApiInvoice = (invoice: Invoice): ApiInvoice => {
  const { operation, resource, value, ...rest } = invoice;
  if (!Object.values(InvoiceOperation).includes(operation)) {
    throw new Error("Invalid invoice operation");
  }
  if (!Object.values(InvoiceableResource).includes(resource)) {
    throw new Error("Invalid invoice resource");
  }
  const operationString = `${resource}.${operation} = ${value}`;
  if (regexTestExpression.test(operationString)) {
    return {
      ...rest,
      operationString
    }
  } else {
    throw new Error("Invalid operation expression");
  }
}