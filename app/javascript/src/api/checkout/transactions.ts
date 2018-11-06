import axios from "axios";
import { Url } from "app/constants";
import { buildJsonUrl } from "app/utils";
import { Invoice } from "app/entities/invoice";
import { handleApiError } from "api/utils/handleApiError";

export const getClientToken = async () => {
  try {
    return await axios.get(buildJsonUrl([Url.Billing.Checkout, "new"]))
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const postCheckout = async (payment_method_token: string, invoices: Invoice[]) => {
  const invoice_ids = invoices.map(invoice => invoice.id);
  try {
    return await axios.post(buildJsonUrl(Url.Billing.Checkout), { checkout: { payment_method_token, invoice_ids } });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}