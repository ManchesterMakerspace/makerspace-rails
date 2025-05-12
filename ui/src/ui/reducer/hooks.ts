import * as React from 'react';
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { ApiDataResponse, ApiErrorResponse } from "makerspace-ts-api-client";
import { State as ReduxState, TransactionAction, Transaction } from "ui/reducer";
import { AuthState } from '../auth/interfaces';
import { TransactionState } from 'ui/hooks/types';

export type Dispatch<Action, Data> = (action: {
  type: Action,
  data?: Data,
  error?: string,
  response?: ApiErrorResponse | ApiDataResponse<Data>;
}) => void;

type StateRef<Action, Data> = { 
  getState: (state: ReduxState) => any;
  dispatch?: Dispatch<Action, Data>
};

export const useAuthState = (): AuthState => {
  const getState = React.useCallback((state) => state.auth, []);
  return useSelector(getState, shallowEqual);
};

export const useApiState = <Resp>(reducerKey: string): [Transaction<Resp>, Dispatch<TransactionAction, Resp>] => {
  const dispatch = useDispatch();

  const dispatchApi = React.useCallback<Dispatch<TransactionAction, Resp>>((action) => {
    dispatch({
      key: reducerKey,
      ...action
    });
  }, [reducerKey]);

  const getState = React.useCallback((state) => getApiState(reducerKey, state), [reducerKey]);

  return [useSelector(getState, shallowEqual), dispatchApi];
}

export const getApiState = (reducerKey: string, state: ReduxState): TransactionState<any>  => {
  return state.base[reducerKey] || { 
    isRequesting: false, 
    error: undefined, 
    response: undefined, 
    data: undefined 
  };
};
