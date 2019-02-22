import axios from "axios";
import { Url } from "app/constants";
import { buildJsonUrl } from "app/utils";
import { handleApiError } from "api/utils/handleApiError";
import { InvoiceOptionQueryParams } from "api/invoices/interfaces";

export const getPlans = async (queryparams?: InvoiceOptionQueryParams) => {
  try {
    return await axios.get(buildJsonUrl(Url.Billing.Plans), { params: queryparams });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const getDiscounts = async (queryparams?: InvoiceOptionQueryParams) => {
  try {
    return await axios.get(buildJsonUrl(Url.Billing.Discounts), { params: queryparams });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}
