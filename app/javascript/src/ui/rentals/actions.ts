import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import omit from "lodash-es/omit";

import { getRentals, postRentals, putRental, deleteRental } from "api/rentals/transactions";
import { Action as RentalsAction } from "ui/rentals/constants";
import { RentalsState } from "ui/rentals/interfaces";
import { Rental, RentalQueryParams } from "app/entities/rental";

export const readRentalsAction = (
  isUserAdmin: boolean,
  queryParams?: RentalQueryParams
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: RentalsAction.StartReadRequest });

  try {
    const response = await getRentals(isUserAdmin, queryParams);
    const { rentals } = response.data;
    const totalItems = response.headers[("total-items")];
    dispatch({
      type: RentalsAction.GetRentalsSuccess,
      data: {
        rentals,
        totalItems: Number(totalItems)
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

export const createRentalAction = (
  rentalForm: Rental
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: RentalsAction.StartCreateRequest });

  try {
    const response = await postRentals(rentalForm);
    const { rental } = response.data;
    dispatch({
      type: RentalsAction.CreateRentalSuccess,
      data: rental
    })
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: RentalsAction.CreateRentalFailure,
      error: errorMessage
    });
  }
};

export const updateRentalAction = (
  rentalId: string,
  updatedRental: Partial<Rental>
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: RentalsAction.StartUpdateRequest });

  try {
    const response = await putRental(rentalId, updatedRental);
    const { rental } = response.data;
    dispatch({
      type: RentalsAction.UpdateRentalSuccess,
      data: rental
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: RentalsAction.UpdateRentalFailure,
      error: errorMessage
    })
  }
};


export const deleteRentalAction = (
  rentalId: string,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: RentalsAction.StartDeleteRequest });

  try {
    await deleteRental(rentalId);
    dispatch({
      type: RentalsAction.DeleteRentalSuccess,
      data: rentalId
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: RentalsAction.DeleteRentalFailure,
      error: errorMessage
    });
  }
}

const defaultState: RentalsState = {
  entities: {},
  read: {
    isRequesting: false,
    error: "",
    totalItems: 0,
  },
  create: {
    isRequesting: false,
    error: "",
  },
  update: {
    isRequesting: false,
    error: "",
  },
  delete: {
    isRequesting: false,
    error: "",
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
    case RentalsAction.StartCreateRequest:
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: true
        }
      };
    case RentalsAction.CreateRentalSuccess:
      const newRental = action.data;
      return {
        ...state,
        entities: {
          ...state.entities,
          [newRental.id]: newRental
        },
        create: {
          ...state.create,
          isRequesting: false,
          error: ""
        }
      };
    case RentalsAction.CreateRentalFailure:
      const { error: createError } = action;
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: false,
          error: createError
        }
      }
    case RentalsAction.StartUpdateRequest:
      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: true
        }
      };
    case RentalsAction.UpdateRentalSuccess:
      const { data: updatedRental } = action;
      return {
        ...state,
        entities: {
          ...state.entities,
          [updatedRental.id]: updatedRental,
        },
        update: {
          ...state.update,
          isRequesting: false,
          error: ""
        }
      };
    case RentalsAction.UpdateRentalFailure:
      const updateError = action.error;

      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: false,
          error: updateError
        }
      }
    case RentalsAction.StartDeleteRequest:
      return {
        ...state,
        delete: {
          ...state.delete,
          isRequesting: true
        }
      };
    case RentalsAction.DeleteRentalSuccess:
      const id = action.data;
      return {
        ...state,
        entities: omit(state.entities, [id]),
        delete: {
          ...state.delete,
          isRequesting: false,
          error: ""
        }
      };
    case RentalsAction.DeleteRentalFailure:
      const deleteError = action.error;

      return {
        ...state,
        delete: {
          ...state.delete,
          isRequesting: false,
          error: deleteError
        }
      }
    default:
      return state;
  }
}