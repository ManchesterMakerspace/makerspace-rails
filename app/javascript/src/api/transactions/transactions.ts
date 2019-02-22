import axios from "axios";
import { Url } from "app/constants";
import { buildJsonUrl } from "app/utils";
import { handleApiError } from "api/utils/handleApiError";

export const postTransaction = async (payment_method_id: string, invoice_id: string) => {
  try {
    return await axios.post(buildJsonUrl(Url.Billing.Transactions), { transaction: { payment_method_id, invoice_id } });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}