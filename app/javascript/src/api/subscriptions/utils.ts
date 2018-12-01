import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";

export const buildSubscriptionsUrl = () => {
  return buildJsonUrl(Url.Admin.Billing.Subscriptions)
}

export const buildSubscriptionUrl = (subId: string, admin: boolean) => {
  return buildJsonUrl(buildSubscriptionPath(subId, admin))
}

const buildSubscriptionPath = (subId: string, admin: boolean) => {
  const path = admin ? Url.Billing.Subscription : Url.Admin.Billing.Subscription;
  return path.replace(Url.PathPlaceholder.SubscriptionId, subId);
}