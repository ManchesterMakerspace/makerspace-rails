import axios from "axios";
import { Url } from "app/constants";
import { buildJsonUrl } from "app/utils";
import { handleApiError } from "api/utils/handleApiError";
import { encodeQueryParams } from "api/utils/encodeQueryParams";
import { InvoiceOptionQueryParams } from "api/invoices/interfaces";

export const getPlans = async (queryparams?: InvoiceOptionQueryParams) => {
  try {
    return await axios.get(buildJsonUrl(Url.Billing.Plans), { params: encodeQueryParams(queryparams) });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}