import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";

export const buildPaymentMethodUrl = (token: string) =>
  buildJsonUrl(buildPaymentMethodPath(token));

const buildPaymentMethodPath = (token: string) => {
  return Url.Billing.PaymentMethod.replace(Url.PathPlaceholder.PaymentMethodId, token);
}
