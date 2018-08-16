import axios from "axios";
import { Url } from "app/constants";
import { buildJsonUrl, handleApiError } from "app/utils";
import { Checkout } from "app/entities/checkout";

export const getClientToken = async () => {
  try {
    return await axios.get(buildJsonUrl([Url.Billing.Checkout, "new"]))
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const postCheckout = async (nonce: string) => {
  try {
    return await axios.post(buildJsonUrl(Url.Billing.Checkout), { checkout: { payment_method_nonce: nonce } });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}