import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import { Invoice } from "app/entities/invoice";
import { getInvoice, putInvoice, deleteInvoice } from "api/invoices/transactions";
import { Action as InvoiceAction } from "ui/invoice/constants";
import { Action as InvoicesAction } from "ui/invoices/constants";
import { InvoiceState } from "ui/invoice/interfaces";

export const readInvoiceAction = (
  invoiceId: string
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: InvoiceAction.StartReadRequest });

  try {
    const { data } = await getInvoice(invoiceId);
    dispatch({
      type: InvoiceAction.GetInvoiceSuccess,
      data: data.invoice
    })
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: InvoiceAction.GetInvoiceFailure,
      error: errorMessage
    });
  }
};

export const updateInvoiceAction = (
  invoiceId: string,
  updateDetails: Partial<Invoice>
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: InvoiceAction.StartUpdateRequest });

  try {
    const response = await putInvoice(invoiceId, updateDetails);
    const { data } = response;
    dispatch({
      type: InvoiceAction.UpdateInvoiceSuccess,
      data: data.invoice
    });
    dispatch({
      type: InvoicesAction.UpdateInvoiceSuccess,
      data
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: InvoiceAction.UpdateInvoiceFailure,
      error: errorMessage
    });
  }
}

export const deleteInvoiceAction = (
  invoiceId: string,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: InvoiceAction.StartDeleteRequest });

  try {
    await deleteInvoice(invoiceId);
    dispatch({
      type: InvoiceAction.DeleteInvoiceSuccess,
    });
    dispatch({
      type: InvoicesAction.DeleteInvoiceSuccess,
      data: invoiceId
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: InvoiceAction.DeleteInvoiceFailure,
      error: errorMessage
    });
  }
}

const defaultState: InvoiceState = {
  entity: undefined,
  stagedEntity: undefined,
  read: {
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

export const invoiceReducer = (state: InvoiceState = defaultState, action: AnyAction) => {
  let error;

  switch (action.type) {
    case InvoiceAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case InvoiceAction.GetInvoiceSuccess:
      const { data: invoice } = action;

      return {
        ...state,
        entity: invoice,
        read: {
          ...state.read,
          isRequesting: false,
          error: ""
        }
      };
    case InvoiceAction.GetInvoiceFailure:
      error = action.error;

      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: false,
          error
        }
      }
    case InvoiceAction.StartUpdateRequest:
      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: true
        }
      };
    case InvoiceAction.UpdateInvoiceSuccess:
      const { data: updatedInvoice } = action;

      return {
        ...state,
        entity: updatedInvoice,
        update: {
          ...state.update,
          isRequesting: false,
          error: ""
        }
      };
    case InvoiceAction.UpdateInvoiceFailure:
      error = action.error;

      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: false,
          error
        }
      }
      case InvoiceAction.StartDeleteRequest:
      return {
        ...state,
        delete: {
          ...state.delete,
          isRequesting: true
        }
      };
    case InvoiceAction.DeleteInvoiceSuccess:
      return {
        ...state,
        entity: defaultState.entity,
        delete: {
          ...state.delete,
          isRequesting: false,
          error: ""
        }
      };
    case InvoiceAction.DeleteInvoiceFailure:
      error = action.error;

      return {
        ...state,
        delete: {
          ...state.delete,
          isRequesting: false,
          error
        }
      }
    default:
      return state;
  }
}