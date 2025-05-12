import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import omit from "lodash-es/omit";

import { Action as BillingAction } from "ui/billing/constants";
import { BillingState } from "ui/billing/interfaces";
import { InvoiceOptionQueryParams } from "app/entities/invoice";
import {
  adminCreateInvoiceOption,
  adminUpdateInvoiceOption,
  InvoiceOption,
  adminDeleteInvoiceOption,
  listInvoiceOptions,
  isApiErrorResponse,
  NewInvoiceOption
} from "makerspace-ts-api-client";

export const readOptionsAction = (
  queryParams?: InvoiceOptionQueryParams,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: BillingAction.StartReadRequest });
  const result = await listInvoiceOptions(queryParams);

  if(isApiErrorResponse(result)) {
    dispatch({
      type: BillingAction.GetOptionsFailure,
      error: result.error.message
    });
  } else {
    const { response, data } = result;
    const totalItems = response.headers[("total-items")];
    dispatch({
      type: BillingAction.GetOptionsSuccess,
      data: {
        options: data,
        totalItems: Number(totalItems)
      }
    });
  }
};

export const createBillingAction = (
  invoiceForm: InvoiceOption
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: BillingAction.StartCreateRequest });

  const result = await adminCreateInvoiceOption({ body: invoiceForm as NewInvoiceOption });
  if (isApiErrorResponse(result)) {
    dispatch({
      type: BillingAction.CreateOptionFailure,
      error: result.error.message
    });
  } else {
    dispatch({
      type: BillingAction.CreateOptionSuccess,
    })
  }
};

export const updateBillingAction = (
  invoiceOptionId: string,
  updateDetails: InvoiceOption
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: BillingAction.StartUpdateRequest });
  const result = await adminUpdateInvoiceOption({ id: invoiceOptionId, body: updateDetails });
  if (isApiErrorResponse(result)) {
    dispatch({
      type: BillingAction.UpdateOptionFailure,
      error: result.error.message
    });
  } else {
    dispatch({
      type: BillingAction.UpdateOptionSuccess,
      data: result.data
    });
  }
}

export const deleteBillingAction = (
  invoiceOptionId: string,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: BillingAction.StartDeleteRequest });
  const result = await adminDeleteInvoiceOption({ id: invoiceOptionId });

  if (isApiErrorResponse(result)) {
    dispatch({
      type: BillingAction.DeleteOptionFailure,
      error: result.error.message
    });
  } else {
    dispatch({
      type: BillingAction.DeleteOptionSuccess,
      data: invoiceOptionId
    });
  }
}

const defaultState: BillingState = {
  entities: {},
  read: {
    isRequesting: false,
    error: "",
    totalItems: 0,
  },
  create: {
    isRequesting: false,
    error: ""
  },
  update: {
    isRequesting: false,
    error: ""
  },
  delete: {
    isRequesting: false,
    error: ""
  },
}

export const billingReducer = (state: BillingState = defaultState, action: AnyAction) => {
  switch (action.type) {
    case BillingAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case BillingAction.GetOptionsSuccess:
      const {
        data: {
          options,
          totalItems,
        }
      } = action;

      const newOptions = {};
      options.forEach((option: InvoiceOption) => {
        newOptions[option.id] = option;
      });

      return {
        ...state,
        entities: newOptions,
        read: {
          ...state.read,
          totalItems,
          isRequesting: false,
          error: ""
        }
      };
    case BillingAction.GetOptionsFailure:
      const { error } = action;
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: false,
          error
        }
      }
    case BillingAction.StartCreateRequest:
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: true
        }
      };
    case BillingAction.CreateOptionSuccess:
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: false,
          error: ""
        }
      };
    case BillingAction.CreateOptionFailure:
      const { error: createError } = action;
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: false,
          error: createError
        }
      }
    case BillingAction.StartUpdateRequest:
      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: true
        }
      };
    case BillingAction.UpdateOptionSuccess:
      const { data: updatedInvoiceOption } = action;

      return {
        ...state,
        entities: {
          ...state.entities,
          [updatedInvoiceOption.id]: updatedInvoiceOption,
        },
        update: {
          ...state.update,
          isRequesting: false,
          error: ""
        }
      };
    case BillingAction.UpdateOptionFailure:
      const updateError = action.error;

      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: false,
          error: updateError
        }
      }
    case BillingAction.StartDeleteRequest:
      return {
        ...state,
        delete: {
          ...state.delete,
          isRequesting: true
        }
      };
    case BillingAction.DeleteOptionSuccess:
      const deletedId = action.data;

      return {
        ...state,
        entities: omit(state.entities, [deletedId]),
        delete: {
          ...state.delete,
          isRequesting: false,
          error: ""
        }
      };
    case BillingAction.DeleteOptionFailure:
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