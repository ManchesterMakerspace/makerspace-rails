import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import isObject from "lodash-es/isObject";
import { postCheckout } from "api/checkout/transactions";

import { Invoice } from "app/entities/invoice";

import { Action as CheckoutAction } from "ui/checkout/constants";
import { CheckoutState } from "ui/checkout/interfaces";
import { pick } from "lodash-es";

export const submitPaymentAction = (
  paymentMethodToken: string,
  invoices: Invoice[],
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: CheckoutAction.StartAsyncRequest });
  try {
    const result = await postCheckout(paymentMethodToken, invoices);
    const { failures } = result.data;
    dispatch({
      type: CheckoutAction.PostCheckoutSuccess,
      data: failures
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: CheckoutAction.PostCheckoutFailure,
      error: errorMessage
    })
  }
};

const defaultState: CheckoutState = {
  invoices: {},
  isRequesting: false,
  error: ""
}


export const checkoutReducer = (state: CheckoutState = defaultState, action: AnyAction) => {

  switch (action.type) {
    case CheckoutAction.StartAsyncRequest:
      return {
        ...state,
        isRequesting: true
      }
    case CheckoutAction.StageInvoicesForPayment:
      const invoices = action.data;
      // Can accept array or collection of invoices to stage
      if (Array.isArray(invoices)) {
        const newInvoices = {};
        invoices.forEach((invoice: Invoice) => {
          newInvoices[invoice.id] = invoice;
        });
        return {
          ...state,
          invoices: {
            ...state.invoices,
            ...newInvoices,
          }
        }
      } else if (isObject(invoices)) {
        return {
          ...state,
          invoices: {
            ...state.invoices,
            ...invoices,
          }
        }
      }
    case CheckoutAction.ResetStagedInvoices:
      return {
        ...state,
        invoices: defaultState.invoices
      }
    case CheckoutAction.PostCheckoutSuccess:
      const failures = action.data as { invoiceIds: string, error: string }[];

      let updatedInvoices = {};
      let checkoutError = "";
      if (failures && failures.length) {
        updatedInvoices = pick(state.invoices, failures.reduce((invoiceIds, failure) => invoiceIds.concat(failure.invoiceIds), []));
        checkoutError = failures.map(failure => failure.error).join("\n");
      }

      return {
        ...state,
        invoices: updatedInvoices,
        isRequesting: false,
        error: checkoutError
      }
    case CheckoutAction.PostCheckoutFailure:
      return {
        ...state,
        isRequesting: false,
        error: action.error
      }
    default:
      return state;
  }
};

