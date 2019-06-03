import axios from "axios";
import { Url } from "app/constants";
import { buildJsonUrl } from "app/utils";
import { handleApiError } from "api/utils/handleApiError";
import { TransactionQueryParams } from "api/transactions/interfaces";
import { buildTransactionsUrl, buildTransactionUrl } from "api/transactions/utils";

export const postTransaction = async (paymentMethodId: string, invoiceId: string) => {
  try {
    return await axios.post(buildJsonUrl(Url.Billing.Transactions), { transaction: { paymentMethodId, invoiceId } });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const getTransactions = async (admin: boolean, querParams: TransactionQueryParams) => {
  try {
    return await axios.get(buildTransactionsUrl(admin), { params: querParams } );
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const deleteTransaction = async (transactionId: string, admin: boolean = false) => {
  try {
    return await axios.delete(buildTransactionUrl(transactionId, admin));
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};