import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";

import { Action as BillingAction } from "ui/billing/constants";
import { BillingState } from "ui/billing/interfaces";
import { getInvoiceOptions, postInvoiceOptions, putInvoiceOption, deleteInvoiceOption } from "api/invoices/transactions";
import { InvoiceOption } from "app/entities/invoice";
import { omit } from "lodash-es";
import { InvoiceOptionQueryParams } from "api/invoices/interfaces";

export const readOptionsAction = (
  queryParams?: InvoiceOptionQueryParams,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: BillingAction.StartReadRequest });

  try {
    const response = await getInvoiceOptions(queryParams);
    const { invoiceOptions: options } = response.data;
    const totalItems = response.headers[("total-items")];
    dispatch({
      type: BillingAction.GetOptionsSuccess,
      data: {
        options,
        totalItems: Number(totalItems)
      }
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: BillingAction.GetOptionsFailure,
      error: errorMessage
    });
  }
};

export const createBillingAction = (
  invoiceForm: InvoiceOption
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: BillingAction.StartCreateRequest });

  try {
    await postInvoiceOptions(invoiceForm);
    dispatch({
      type: BillingAction.CreateOptionSuccess,
    })
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: BillingAction.CreateOptionFailure,
      error: errorMessage
    });
  }
};

export const updateBillingAction = (
  invoiceOptionId: string,
  updateDetails: Partial<InvoiceOption>
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: BillingAction.StartUpdateRequest });

  try {
    const response = await putInvoiceOption(invoiceOptionId, updateDetails);
    const { data } = response;
    dispatch({
      type: BillingAction.UpdateOptionSuccess,
      data: data.invoiceOption
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: BillingAction.UpdateOptionFailure,
      error: errorMessage
    });
  }
}

export const deleteBillingAction = (
  invoiceOptionId: string,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: BillingAction.StartDeleteRequest });

  try {
    await deleteInvoiceOption(invoiceOptionId);
    dispatch({
      type: BillingAction.DeleteOptionSuccess,
      data: invoiceOptionId
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: BillingAction.DeleteOptionFailure,
      error: errorMessage
    });
  }
}

const defaultState: BillingState = {
  entities: {},
  selectedOption: undefined,
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
    case BillingAction.SelectOption:
      const selectedOption = action.data;
      return {
        ...state,
        selectedOption: {
          ...selectedOption
        },
      }
    case BillingAction.ClearSelection:
      return {
        ...state,
        selectedOption: undefined
      };
    default:
      return state;
  }
}