import axios from "axios";
import { QueryParams } from "app/interfaces";
import { handleApiError } from "app/utils";
import { Invoice } from "app/entities/invoice";

import { buildInvoicesUrl, buildInvoiceUrl } from "api/invoices/utils";

export const getInvoices = async (isUserAdmin: boolean, queryParams?: QueryParams) => {
  try {
    return await axios.get(buildInvoicesUrl(isUserAdmin), { params: queryParams });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};

export const postInvoices = async (invoiceForm: Invoice) => {
  try {
    return await axios.post(buildInvoicesUrl(true), { params: { invoice: invoiceForm } });
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
    return await axios.post(buildInvoiceUrl(invoiceId), { params: { invoice: invoiceForm } });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};