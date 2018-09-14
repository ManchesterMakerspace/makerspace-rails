import axios from "axios";
import { handleApiError } from "app/utils";
import { Invoice, InvoiceQueryParams } from "app/entities/invoice";

import { buildInvoicesUrl, buildInvoiceUrl } from "api/invoices/utils";

export const getInvoices = async (isUserAdmin: boolean, queryParams?: InvoiceQueryParams) => {
  try {
    return await axios.get(buildInvoicesUrl(isUserAdmin), { params: queryParams });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};

export const postInvoices = async (invoiceForm: Invoice) => {
  const invoice = {
    ...invoiceForm,
    member_id: invoiceForm.memberId
  };
  delete invoice.memberId;
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