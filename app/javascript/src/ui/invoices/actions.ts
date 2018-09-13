import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import toNumber from "lodash-es/toNumber";

import { QueryParams } from "app/interfaces";
import { Invoice } from "app/entities/invoice";
import { getInvoices, postInvoices } from "api/invoices/transactions";
import { Action as InvoicesAction } from "ui/invoices/constants";
import { InvoicesState } from "ui/invoices/interfaces";

export const readInvoicesAction = (
  isUserAdmin: boolean,
  queryParams?: QueryParams,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: InvoicesAction.StartReadRequest });

  try {
    const response = await getInvoices(isUserAdmin, queryParams);
    const invoices = response.data;
    const totalItems = response.headers[("total-items")];
    dispatch({
      type: InvoicesAction.GetInvoicesSuccess,
      data: {
        invoices,
        totalItems: toNumber(totalItems)
      }
    })
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: InvoicesAction.GetInvoicesFailure,
      error: errorMessage
    });
  }
};

export const createInvoiceAction = (
  invoiceForm: Invoice
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: InvoicesAction.StartCreateRequest });

  try {
    await postInvoices(invoiceForm);
    dispatch({
      type: InvoicesAction.CreateInvoiceSuccess,
    })
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: InvoicesAction.CreateInvoiceFailure,
      error: errorMessage
    });
  }
};


const defaultState: InvoicesState = {
  entities: {},
  read: {
    isRequesting: false,
    error: "",
    totalItems: 0,
  }
}


export const invoicesReducer = (state: InvoicesState = defaultState, action: AnyAction) => {
  switch (action.type) {
    case InvoicesAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case InvoicesAction.GetInvoicesSuccess:
      const {
        data: {
          invoices,
          totalItems,
        }
      } = action;

      const newInvoices = {};
      invoices.forEach((invoice: Invoice) => {
        newInvoices[invoice.id] = invoice;
      });

      return {
        ...state,
        entities: newInvoices,
        read: {
          ...state.read,
          totalItems,
          isRequesting: false,
          error: ""
        }
      };
    case InvoicesAction.GetInvoicesFailure:
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