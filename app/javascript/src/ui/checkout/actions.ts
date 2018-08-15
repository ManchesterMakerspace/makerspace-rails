import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import { getClientToken } from "api/checkout/transactions";

import { Action as CheckoutAction } from "ui/checkout/constants";
import { CheckoutState } from "ui/checkout/interfaces";

export const getClientTokenAction = (
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: CheckoutAction.StartClientTokenRequest });
  try {
    const response = await getClientToken();
    dispatch({
      type: CheckoutAction.GetClientTokenSuccess,
      data: response.data
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: CheckoutAction.GetClientTokenFailure,
      error: errorMessage
    })
  }
};

const defaultState: CheckoutState = {
  clientToken: undefined,
  isRequesting: false,
  error: ""
}


export const checkoutReducer = (state: CheckoutState = defaultState, action: AnyAction) => {

  switch (action.type) {
    case CheckoutAction.StartClientTokenRequest:
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
    default:
      return state;
  }
};

