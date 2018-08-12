import axios from "axios";
import { Url } from "app/constants";
import { buildJsonUrl, handleApiError } from "app/utils";
import { QueryParams } from "app/interfaces";
import { Checkout } from "app/entities/checkout";

export const getPlans = async () => {
  try {
    return await axios.get(buildJsonUrl(Url.Billing.Plans));
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const getSubscriptions = async (queryParams?: QueryParams) => {
  try {
    return await axios.get(buildJsonUrl(Url.Billing.Subscriptions), { params: queryParams });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const findCustomer = async (customerId: string) => {

}

export const getClientToken = async () => {
  try {
    return await axios.get(buildJsonUrl([Url.Billing.Checkout, "new"]))
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const postCheckout = async (checkoutDetails: Checkout) => {
  try {
    return await axios.post(buildJsonUrl(Url.Billing.Checkout), { checkout: checkoutDetails });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}