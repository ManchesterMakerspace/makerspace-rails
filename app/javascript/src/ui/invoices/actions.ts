import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import toNumber from "lodash-es/toNumber";
import omit from "lodash-es/omit";

import { Invoice, InvoiceQueryParams, InvoiceOption } from "app/entities/invoice";
import { getInvoices, postInvoices, getMembershipOptions } from "api/invoices/transactions";
import { Action as InvoicesAction } from "ui/invoices/constants";
import { InvoicesState } from "ui/invoices/interfaces";
import { CollectionOf } from "app/interfaces";

export const readInvoicesAction = (
  isUserAdmin: boolean,
  queryParams?: InvoiceQueryParams,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: InvoicesAction.StartReadRequest });

  try {
    const response = await getInvoices(isUserAdmin, queryParams);
    const {invoices} = response.data;
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

export const getMembershipOptionsAction = (
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: InvoicesAction.StartMembershipOptionsRequest });

  try {
    const response = await getMembershipOptions();
    const { invoices } = response.data;
    dispatch({
      type: InvoicesAction.GetMembershipOptionsSuccess,
      data: invoices
    })
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: InvoicesAction.GetMembershipOptionsFailure,
      error: errorMessage
    });
  }
};

const defaultState: InvoicesState = {
  entities: {},
  invoiceOptions: {
    membership: {},
    rentals: {},
  },
  read: {
    isRequesting: false,
    error: "",
    totalItems: 0,
  },
  create: {
    isRequesting: false,
    error: "",
  },
  options: {
    isRequesting: false,
    error: "",
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
    case InvoicesAction.UpdateInvoiceSuccess:
      const { data: updatedInvoice } = action;

      return {
        ...state,
        entities: {
          ...state.entities,
          [updatedInvoice.id]: updatedInvoice
        }
      };
    case InvoicesAction.DeleteInvoiceSuccess:
      const { data: deletedId } = action;

      return {
        ...state,
        entities: {
          ...omit(state.entities, deletedId)
        }
      };
    case InvoicesAction.StartCreateRequest:
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: true
        }
      };
    case InvoicesAction.CreateInvoiceSuccess:
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: false,
          error: ""
        }
      };
    case InvoicesAction.CreateInvoiceFailure:
      const { error: createError } = action;
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: false,
          error: createError
        }
      }
    case InvoicesAction.StartMembershipOptionsRequest:
      return {
        ...state,
        options: {
          ...state.options,
          isRequesting: true,
        }
      }
    case InvoicesAction.GetMembershipOptionsSuccess:
      const { data: membershipOptions } = action;
      const membershipCollection = membershipOptions.reduce((membershipCollection: CollectionOf<InvoiceOption>, option: InvoiceOption) => {
        membershipCollection[option.id] = option;
        return membershipCollection;
      }, {});
      return {
        ...state,
        invoiceOptions: {
          ...state.invoiceOptions,
          membership: {
            ...state.invoiceOptions.membership,
            ...membershipCollection
          }
        }
      }
    case InvoicesAction.GetMembershipOptionsFailure:
      const { error: optionError } = action;
      return {
        ...state,
        invoiceOptions: {
          ...state.invoiceOptions,
          isRequesting: false,
          error: optionError
        }
      }
    default:
      return state;
  }
}