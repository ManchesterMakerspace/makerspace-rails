import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";

export const buildSubscriptionsUrl = (admin: boolean) => {
  return buildJsonUrl(admin ? Url.Admin.Billing.Subscriptions : Url.Billing.Subscriptions)
}

export const buildSubscriptionUrl = (subId: string, admin: boolean) => {
  return buildJsonUrl(buildSubscriptionPath(subId, admin))
}

const buildSubscriptionPath = (subId: string, admin: boolean) => {
  const path = admin ? Url.Admin.Billing.Subscription : Url.Billing.Subscription;
  return path.replace(Url.PathPlaceholder.SubscriptionId, subId);
}