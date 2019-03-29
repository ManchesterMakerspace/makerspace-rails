import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";

export const buildTransactionsUrl = (admin: boolean = false): string => {
  return buildJsonUrl(admin ? Url.Admin.Billing.Transactions : Url.Billing.Transactions);
}

export const buildTransactionUrl = (transactionId: string, admin: boolean) => {
  return buildJsonUrl(buildTransactionPath(transactionId, admin));
}

const buildTransactionPath = (transactionId: string, admin: boolean) => {
  return (admin ? Url.Admin : Url).Billing.Transaction.replace(Url.PathPlaceholder.TransactionId, transactionId);
}
