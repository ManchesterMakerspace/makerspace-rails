import axios from "axios";
import { Invoice, InvoiceQueryParams, InvoiceOption, InvoiceOptionSelection } from "app/entities/invoice";

import { buildInvoicesUrl, buildInvoiceUrl, buildInvoiceOptionsUrl } from "api/invoices/utils";
import { InvoiceOptionQueryParams } from "api/invoices/interfaces";
import { handleApiError } from "api/utils/handleApiError";

export const getInvoices = async (isUserAdmin: boolean, queryParams?: InvoiceQueryParams) => {
  try {
    return await axios.get(buildInvoicesUrl(isUserAdmin), { params: (queryParams) });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};

export const postInvoices = async (invoiceForm: Invoice | InvoiceOptionSelection, admin: boolean = false) => {
  try {
    return await axios.post(buildInvoicesUrl(admin), ((invoiceForm as InvoiceOptionSelection).invoiceOptionId ?
      { invoiceOption: invoiceForm }
      : { invoice: invoiceForm }));
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

export const getInvoiceOptions = async (queryParams?: InvoiceOptionQueryParams) => {
  try {
    return await axios.get(buildInvoiceOptionsUrl(), { params: (queryParams) });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};

export const postInvoiceOptions = async (invoiceOptionForm: InvoiceOption) => {
  try {
    return await axios.post(buildInvoiceOptionsUrl(null, true), { invoiceOption: invoiceOptionForm });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};


export const getInvoiceOption = async (invoiceOptionId: string) => {
  try {
    return await axios.get(buildInvoiceOptionsUrl(invoiceOptionId));
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};

export const putInvoiceOption = async (invoiceOptionId: string, invoiceOptionForm: Partial<InvoiceOption>) => {
  try {
    return await axios.put(buildInvoiceOptionsUrl(invoiceOptionId), { invoiceOption: invoiceOptionForm });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};

export const deleteInvoiceOption = async (invoiceOptionId: string) => {
  try {
    return await axios.delete(buildInvoiceOptionsUrl(invoiceOptionId));
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};