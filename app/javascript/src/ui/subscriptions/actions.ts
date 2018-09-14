import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import toNumber from "lodash-es/toNumber";

import { QueryParams } from "app/interfaces";
import { getSubscriptions } from "api/subscriptions/transactions";
import { Action as SubscriptionsAction } from "ui/subscriptions/constants";
import { SubscriptionsState } from "ui/subscriptions/interfaces";
import { Subscription } from "app/entities/subscription";

export const readSubscriptionsAction = (
  queryParams?: QueryParams
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: SubscriptionsAction.StartReadRequest });

  try {
    const response = await getSubscriptions(queryParams);
    const {subscriptions} = response.data;
    const totalItems = response.headers[("total-items")];
    dispatch({
      type: SubscriptionsAction.GetSubscriptionsSuccess,
      data: {
        subscriptions,
        totalItems: toNumber(totalItems)
      }
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: SubscriptionsAction.GetSubscriptionsFailure,
      error: errorMessage
    });
  }
};

const defaultState: SubscriptionsState = {
  entities: {},
  read: {
    isRequesting: false,
    error: "",
    totalItems: 0,
  }
}

export const subscriptionsReducer = (state: SubscriptionsState = defaultState, action: AnyAction) => {
  switch (action.type) {
    case SubscriptionsAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case SubscriptionsAction.GetSubscriptionsSuccess:
      const {
        data: {
          subscriptions,
          totalItems,
        }
      } = action;

      const newSubs = {};
      subscriptions.forEach((sub: Subscription) => {
        newSubs[sub.id] = sub;
      });

      return {
        ...state,
        entities: newSubs,
        read: {
          ...state.read,
          totalItems,
          isRequesting: false,
          error: ""
        }
      };
    case SubscriptionsAction.GetSubscriptionsFailure:
      const { error } = action;
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: false,
          error
        }
      }
    default:
      return state;
  }
}