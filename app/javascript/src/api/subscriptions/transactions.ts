import axios from "axios";
import { Url } from "app/constants";
import { buildJsonUrl } from "app/utils";
import { QueryParams } from "app/interfaces";
import { encodeQueryParams } from "api/utils/encodeQueryParams";
import { handleApiError } from "api/utils/handleApiError";
import { Subscription } from "app/entities/subscription";
import { buildSubscriptionUrl, buildSubscriptionsUrl } from "api/subscriptions/utils";

export const getSubscriptions = async (queryParams?: QueryParams) => {
  try {
    return await axios.get(buildSubscriptionsUrl(), { params: encodeQueryParams(queryParams) });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const getSubscription = async (subId: string, admin: boolean = false) => {
  try {
    return await axios.get(buildSubscriptionUrl(subId, admin));
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};

export const putSubscription = async (subId: string, subscriptionForm: Partial<Subscription>, admin: boolean = false) => {
  try {
    return await axios.put(buildSubscriptionUrl(subId, admin), { subscription: subscriptionForm });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};

export const deleteSubscription = async (subId: string, admin: boolean = false) => {
  try {
    return await axios.delete(buildSubscriptionUrl(subId, admin));
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};