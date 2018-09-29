import axios from "axios";
import { handleApiError } from "app/utils";
import { Invoice, InvoiceQueryParams } from "app/entities/invoice";

import { buildInvoicesUrl, buildInvoiceUrl, buildInvoiceOptionsUrl } from "api/invoices/utils";
import { InvoiceOptionTypes } from "api/invoices/constants";
import { encodeQueryParams } from "api/utils/encodeQueryParams";

export const getInvoices = async (isUserAdmin: boolean, queryParams?: InvoiceQueryParams) => {
  try {
    return await axios.get(buildInvoicesUrl(isUserAdmin), { params: encodeQueryParams(queryParams) });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};

export const postInvoices = async (invoiceForm: Invoice) => {
  const invoice = {
    ...invoiceForm,
    resource_id: invoiceForm.resourceId
  };
  delete invoice.resourceId;
  try {
    return await axios.post(buildInvoicesUrl(true), { invoice });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};


export const getInvoice = async (invoiceId: string) => {
  try {
    return await axios.get(buildInvoiceUrl(invoiceId));
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};

export const putInvoice = async (invoiceId: string, invoiceForm: Partial<Invoice>) => {
  try {
    return await axios.put(buildInvoiceUrl(invoiceId), { invoice: invoiceForm });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};

export const deleteInvoice = async (invoiceId: string) => {
  try {
    return await axios.delete(buildInvoiceUrl(invoiceId));
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};

export const getMembershipOptions = async () => {
  const options = {
    types: [InvoiceOptionTypes.Membership]
  }
  try {
    return await axios.get(buildInvoiceOptionsUrl(), { params: encodeQueryParams(options) });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}