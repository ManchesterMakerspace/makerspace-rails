import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";

import { getCard, putCard } from "api/accessCards/transactions";
import { Action as CardAction } from "ui/accessCards/constants";
import { CardState } from "ui/accessCards/interfaces";
import { AccessCard } from "app/entities/card";

export const readCardAction = (
  cardId: string
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: CardAction.StartReadRequest });

  try {
    const response = await getCard(cardId);
    const { data } = response;
    dispatch({
      type: CardAction.GetCardSuccess,
      data
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: CardAction.GetCardFailure,
      error: errorMessage
    });
  }
};

export const updateCardAction = (
  cardId: string,
  updateDetails: Partial<AccessCard>
): ThunkAction<Promise<void>, {}, {}, AnyAction > => async (dispatch) => {
  dispatch({ type: CardAction.StartUpdateRequest });

  try {
    const response = await putCard(cardId, updateDetails);
    const { data } = response;
    dispatch({
      type: CardAction.UpdateCardSuccess,
      data
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: CardAction.UpdateCardFailure,
      error: errorMessage
    });
  }
}

const defaultState: CardState = {
  entity: undefined,
  read: {
    isRequesting: false,
    error: "",
  },
  update: {
    isRequesting: false,
    error: "",
  }
}

export const cardReducer = (state: CardState = defaultState, action: AnyAction) => {
  let error;

  switch (action.type) {
    case CardAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case CardAction.GetCardSuccess:
      const { data } = action;

      return {
        ...state,
        entity: data,
        read: {
          ...state.read,
          isRequesting: false,
          error: ""
        }
      };
    case CardAction.GetCardFailure:
      error = action.error;

      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: false,
          error
        }
      }
    case CardAction.StartUpdateRequest:
      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: true
        }
      };
    case CardAction.UpdateCardSuccess:
      const { data: updatedCard } = action;

      return {
        ...state,
        entity: updatedCard,
        update: {
          ...state.update,
          isRequesting: false,
          error: ""
        }
      };
    case CardAction.UpdateCardFailure:
      error = action.error;

      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: false,
          error
        }
      }
    default:
      return state;
  }
}
