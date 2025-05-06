import { combineReducers, Action, AnyAction } from "redux";
import { History } from "history";
import { ThunkDispatch, ThunkAction } from "redux-thunk";
import { connectRouter, RouterState } from 'connected-react-router';

import { AuthState } from "ui/auth/interfaces";
import { authReducer } from "ui/auth/actions";
import { BillingState } from "ui/billing/interfaces";
import { billingReducer } from "ui/billing/actions";
import { EarnedMembershipsState } from "ui/earnedMemberships/interfaces";
import { earnedMembershipsReducer } from "ui/earnedMemberships/actions";
import { RequestStatus } from "app/interfaces";
import { ApiErrorResponse, ApiDataResponse } from "makerspace-ts-api-client";
import { cartReducer, CartState } from "./checkout/cart";

export type ScopedThunkDispatch = ThunkDispatch<State, {}, Action>
export type ScopedThunkAction<T> = ThunkAction<T, State, {}, AnyAction>;

export interface State  {
  router: RouterState;
  base: { [key: string]: Transaction<any> }
  auth: AuthState;
  cart: CartState;
  billing: BillingState;
  earnedMemberships: EarnedMembershipsState;
}

export const getRootReducer = (history: History) => combineReducers({
  router: connectRouter(history),
  base: baseReducer,
  auth: authReducer,
  cart: cartReducer,
  billing: billingReducer,
  earnedMemberships: earnedMembershipsReducer,
});

export type Transaction<T> = RequestStatus & {
  data: T;
  response: ApiErrorResponse | ApiDataResponse<T>;
}
export interface ReducerAction<T> {
  type: string;
  key: string;
  data?: T;
  response?: ApiErrorResponse | ApiDataResponse<T>;
  error?: ApiErrorResponse;
}

export enum TransactionAction {
  Start = "start",
  Success = "success",
  Failure = "failure",
  Reset = "reset"
}

const baseReducer = <T>(state: { [key: string]: Transaction<T> } = {}, action: AnyAction) => {
  let key;
  switch (action.type) {
    case TransactionAction.Start:
      key = action.key;

      return {
        ...state,
        [key]: {
          ...state[key],
          isRequesting: true,
        }
      };

    case TransactionAction.Success:
      const { data, response } = action;
      key = action.key;
      return {
        ...state,
        [key]: {
          ...state[key],
          data,
          response,
          isRequesting: false,
          error: undefined,
        }
      };

    case TransactionAction.Failure:
      const { error } = action;
      key = action.key;

      return {
        ...state,
        [key]: {
          ...state[key],
          error,
          isRequesting: false,
        }
      };
    case TransactionAction.Reset:
      return { ...state };
    default:
      return state;
  }
}