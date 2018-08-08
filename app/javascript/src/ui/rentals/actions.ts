import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import toNumber from "lodash-es/toNumber";

import { getRentals } from "api/rentals/transactions";
import { Action as RentalsAction } from "ui/rentals/constants";
import { handleApiError } from "app/utils";
import { RentalsState } from "ui/rentals/interfaces";
import { QueryParams } from "app/interfaces";
import { Rental } from "app/entities/rental";

export const readRentalsAction = (
  queryParams?: QueryParams
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: RentalsAction.StartReadRequest });

  try {
    const response = await getRentals(queryParams);
    const rentals = response.data;
    const totalItems = response.headers[("total-items")];
    dispatch({
      type: RentalsAction.GetRentalsSuccess,
      data: {
        rentals,
        totalItems: toNumber(totalItems)
      }
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: RentalsAction.GetRentalsFailure,
      error: errorMessage
    });
  }
};

const defaultState: RentalsState = {
  entities: {},
  read: {
    isRequesting: false,
    error: "",
    totalItems: 0,
  }
}

export const rentalsReducer = (state: RentalsState = defaultState, action: AnyAction) => {
  switch (action.type) {
    case RentalsAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case RentalsAction.GetRentalsSuccess:
      const {
        data: {
          rentals,
          totalItems,
        }
      } = action;

      const newRentals = {};
      rentals.forEach((rental: Rental) => {
        newRentals[rental.id] = rental;
      });

      return {
        ...state,
        entities: newRentals,
        read: {
          ...state.read,
          totalItems,
          isRequesting: false,
          error: ""
        }
      };
    case RentalsAction.GetRentalsFailure:
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