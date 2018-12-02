import axios from "axios";
import { Url } from "app/constants";
import { buildJsonUrl } from "app/utils";
import { handleApiError } from "api/utils/handleApiError";
import { buildPaymentMethodUrl } from "api/paymentMethods/utils";

export const getPaymentMethods = async () => {
  try {
    return await axios.get(buildJsonUrl(Url.Billing.PaymentMethods));
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const postPaymentMethod = async (paymentMethodNonce: string, makeDefault: boolean = false) => {
  try {
    return await axios.post(buildJsonUrl(Url.Billing.PaymentMethods), {
      paymentMethod: {
        paymentMethodNonce,
        makeDefault
      }
    });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const deletePaymentMethod = async (paymentMethodToken: string) => {
  try {
    return await axios.get(buildPaymentMethodUrl(paymentMethodToken));
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}