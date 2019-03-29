import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import omit from "lodash-es/omit";

import { getSubscriptions, deleteSubscription, getSubscription, SubscriptionQueryParams, putSubscription } from "api/subscriptions/transactions";
import { Action as SubscriptionsAction } from "ui/subscriptions/constants";
import { SubscriptionsState } from "ui/subscriptions/interfaces";
import { Subscription, SubscriptionUpdate } from "app/entities/subscription";

export const readSubscriptionsAction = (
  queryParams?: SubscriptionQueryParams
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: SubscriptionsAction.StartReadRequest });

  try {
    const response = await getSubscriptions(queryParams, true);
    const {subscriptions} = response.data;
    const totalItems = response.headers[("total-items")];
    dispatch({
      type: SubscriptionsAction.GetSubscriptionsSuccess,
      data: {
        subscriptions,
        totalItems: Number(totalItems)
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

export const readSubscriptionAction = (
  id: string
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: SubscriptionsAction.StartReadRequest });

  try {
    const response = await getSubscription(id);
    const { subscription } = response.data;
    dispatch({
      type: SubscriptionsAction.GetSubscriptionsSuccess,
      data: {
        subscriptions: [subscription],
        totalItems: 1
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

export const deleteSubscriptionAction = (
  subscriptionId: string,
  admin: boolean = false,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: SubscriptionsAction.StartDeleteRequest });

  try {
    await deleteSubscription(subscriptionId, admin);
    dispatch({
      type: SubscriptionsAction.DeleteSuccess,
      data: subscriptionId
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: SubscriptionsAction.DeleteFailure,
      error: errorMessage
    });
  }
}

export const updateSubscriptionAction = (
  subscriptionId: string,
  subscriptionUpdate: SubscriptionUpdate,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: SubscriptionsAction.StartUpdateRequest });

  try {
    await putSubscription(subscriptionId, subscriptionUpdate);
    dispatch({
      type: SubscriptionsAction.UpdateSuccess,
      data: subscriptionId
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: SubscriptionsAction.UpdateFailure,
      error: errorMessage
    });
  }
}

const defaultState: SubscriptionsState = {
  entities: {},
  read: {
    isRequesting: false,
    error: "",
    totalItems: 0,
  },
  delete: {
    isRequesting: false,
    error: ""
  },
  update: {
    isRequesting: false,
    error: ""
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
    case SubscriptionsAction.StartDeleteRequest:
      return {
        ...state,
        delete: {
          ...state.delete,
          isRequesting: true
        }
      };
    case SubscriptionsAction.DeleteSuccess:
      return {
        ...state,
        entities: omit(state.entities, [action.data]),
        delete: {
          ...state.delete,
          isRequesting: false,
          error: ""
        }
      };
    case SubscriptionsAction.DeleteFailure:
      const deleteError = action.error;

      return {
        ...state,
        delete: {
          ...state.delete,
          isRequesting: false,
          error: deleteError,
        }
      }
    case SubscriptionsAction.StartUpdateRequest:
      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: true
        }
      }
    case SubscriptionsAction.UpdateSuccess:
      const updatedSub = action.data;

      return {
        ...state,
        entities: {
          ...state.entities,
          [updatedSub.id]: updatedSub
        },
        update: {
          ...state.update,
          isRequesting: false,
          error: ""
        }
      }
    case SubscriptionsAction.UpdateFailure:
      const updateError = action.error;
      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: false,
          error: updateError
        }
      }
    default:
      return state;
  }
}