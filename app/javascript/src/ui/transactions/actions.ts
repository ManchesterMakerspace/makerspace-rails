import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";

import { getTransactions, deleteTransaction } from "api/transactions/transactions";
import { Action as TransactionsAction } from "ui/transactions/constants";
import { TransactionsState } from "ui/transactions/interfaces";
import { Transaction } from "app/entities/transaction";
import { TransactionQueryParams } from "api/transactions/interfaces";
import { Invoice } from "app/entities/invoice";

export const readTransactionsAction = (
  isUserAdmin: boolean,
  queryParams?: TransactionQueryParams
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: TransactionsAction.StartReadRequest });

  try {
    const response = await getTransactions(isUserAdmin, queryParams);
    const transactions: Transaction[] = response.data.transactions;

    const totalItems = response.headers[("total-items")];
    dispatch({
      type: TransactionsAction.GetTransactionsSuccess,
      data: {
        transactions,
        totalItems: Number(totalItems)
      }
    });
  } catch (e) {
    const { errorMessage } = e;
    if (!errorMessage) {
      throw e;
    }
    dispatch({
      type: TransactionsAction.GetTransactionsFailure,
      error: errorMessage
    });
  }
};

export const refundTransactionAction = (
  transactionId: string,
  admin: boolean,
): ThunkAction<Promise<boolean>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: TransactionsAction.StartDeleteRequest });

  try {
    const response = await deleteTransaction(transactionId, admin);
    const { transaction, invoice } = response.data;
    const refundedTransaction = transaction && {
      ...transaction,
      invoice
    };
    dispatch({
      type: TransactionsAction.DeleteTransactionSuccess,
      data: refundedTransaction
    });
    return true;
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: TransactionsAction.DeleteTransactionFailure,
      error: errorMessage
    });
  }
}

const defaultState: TransactionsState = {
  entities: {},
  read: {
    isRequesting: false,
    error: "",
    totalItems: 0,
  },
  delete: {
    isRequesting: false,
    error: "",
  }
}

export const transactionsReducer = (state: TransactionsState = defaultState, action: AnyAction) => {
  switch (action.type) {
    case TransactionsAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case TransactionsAction.GetTransactionsSuccess:
      const {
        data: {
          transactions,
          totalItems,
        }
      } = action;

      const newTransactions = {};
      transactions.forEach((transaction: Transaction) => {
        newTransactions[transaction.id] = transaction;
      });

      return {
        ...state,
        entities: newTransactions,
        read: {
          ...state.read,
          totalItems,
          isRequesting: false,
          error: ""
        }
      };
    case TransactionsAction.GetTransactionsFailure:
      const { error } = action;
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: false,
          error
        }
      }
    case TransactionsAction.StartDeleteRequest:
      return {
        ...state,
        delete: {
          ...state.delete,
          isRequesting: true
        }
      };
    case TransactionsAction.DeleteTransactionSuccess:
      const refundedTransaction = action.data;

      return {
        ...state,
        entities: {
          ...state.entities,
          ...refundedTransaction && { [refundedTransaction.id]: refundedTransaction },
        },
        delete: {
          ...state.delete,
          isRequesting: false,
          error: ""
        }
      };
    case TransactionsAction.DeleteTransactionFailure:
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