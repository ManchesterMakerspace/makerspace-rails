import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";

import { getClientToken, postCheckout } from "api/checkout/transactions";

import { CollectionOf } from "app/interfaces";
import { Invoice } from "app/entities/invoice";

import { Action as CheckoutAction } from "ui/checkout/constants";
import { CheckoutState } from "ui/checkout/interfaces";

export const getClientTokenAction = (
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: CheckoutAction.StartAsyncRequest });
  try {
    const response = await getClientToken();
    dispatch({
      type: CheckoutAction.GetClientTokenSuccess,
      data: response.data.client_token
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: CheckoutAction.GetClientTokenFailure,
      error: errorMessage
    })
  }
};

export const submitPaymentAction = (
  nonce: string
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: CheckoutAction.StartAsyncRequest });
  try {
    const response = await postCheckout(nonce);
    dispatch({
      type: CheckoutAction.PostCheckoutSuccess,
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
  clientToken: undefined,
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
    case CheckoutAction.GetClientTokenSuccess:
      return {
        ...state,
        clientToken: action.data,
        isRequesting: false,
        error: "",
      }
    case CheckoutAction.GetClientTokenFailure:
      return {
        ...state,
        isRequesting: false,
        error: action.error
      }
    case CheckoutAction.StageInvoicesForPayment:
      const invoices = action.data;
      return {
        ...state,
        invoices: {
          ...invoices,
        }
      }
    case CheckoutAction.ResetStagedInvoices:
      return {
        ...state,
        invoices: defaultState.invoices
      }
    default:
      return state;
  }
};

