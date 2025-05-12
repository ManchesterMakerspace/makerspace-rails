import * as React from "react";
import { ApiErrorResponse, ApiDataResponse, isApiErrorResponse } from "makerspace-ts-api-client";

import { TransactionState, ApiFunction } from "ui/hooks/types";

interface CallTransactionState<Args, Data> extends TransactionState<Data> {
  call: ApiFunction<Args, Data>;
  reset: () => void;
}
export type SuccessTransactionState<Args, Resp> = {
  response: ApiDataResponse<Resp>,
  reset: () => void;
  call: ApiFunction<Args, Resp>;
};

const useWriteTransaction = <Args, Resp>(
  transaction: ApiFunction<Args, Resp>,
  onSuccess?: (state: SuccessTransactionState<Args, Resp>) => void
): CallTransactionState<Args, Resp> => {
  const [state, setState] = React.useState({ isRequesting: false, error: "", data: undefined, called: false, response: undefined });

  const reset = React.useCallback(() => {
    setState({ isRequesting: false, error: "", data: undefined, called: false, response: undefined });
  }, [setState]);

  const call: ApiFunction<Args, Resp> = React.useCallback(async (args: Args) => {
    setState(prevState => ({ ...prevState, isRequesting: true, called: true }));

    const response = await transaction(args);
    const error = (response as ApiErrorResponse).error;

    setState(prevState => ({
      ...prevState,
      response,
      isRequesting: false,
      error: error && error.message,
      data: (response as ApiDataResponse<Resp>).data
    }));

    if (!isApiErrorResponse(response)) {
      onSuccess && onSuccess({ response, call, reset });
    }

    return response;
  }, [onSuccess, transaction, reset]);

  return { ...state, call, reset };
};

export default useWriteTransaction;;
