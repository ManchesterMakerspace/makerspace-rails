import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";

import { getCards, putCard, postCard } from "api/accessCards/transactions";
import { Action as CardAction } from "ui/accessCards/constants";
import { CardState } from "ui/accessCards/interfaces";
import { AccessCard } from "app/entities/card";

export const readCardsAction = (
  cardId: string
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: CardAction.StartReadRequest });

  try {
    const response = await getCards(cardId);
    const { data } = response;
    dispatch({
      type: CardAction.GetCardsSuccess,
      data: data.cards
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: CardAction.GetCardsFailure,
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
      data: data.cards
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: CardAction.UpdateCardFailure,
      error: errorMessage
    });
  }
}

export const createCardAction = (
  memberId: string,
  uid: string,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: CardAction.StartCreateRequest });

  try {
    const response = await postCard(memberId, uid);
    const { data } = response;
    dispatch({
      type: CardAction.CreateCardSuccess,
      data: data.card
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: CardAction.CreateCardFailure,
      error: errorMessage
    });
  }
}

const defaultState: CardState = {
  entities: undefined,
  read: {
    isRequesting: false,
    error: "",
  },
  create: {
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
    case CardAction.GetCardsSuccess:
      const { data } = action;

      return {
        ...state,
        entities: data,
        read: {
          ...state.read,
          isRequesting: false,
          error: ""
        }
      };
    case CardAction.GetCardsFailure:
      error = action.error;

      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: false,
          error
        }
      }
    case CardAction.StartCreateRequest:
      return {
        ...state,
        create: {
          ...state.read,
          isRequesting: true
        }
      };
    case CardAction.CreateCardSuccess:

      return {
        ...state,
        create: {
          ...state.read,
          isRequesting: false,
          error: ""
        }
      };
    case CardAction.CreateCardFailure:
      error = action.error;

      return {
        ...state,
        create: {
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
