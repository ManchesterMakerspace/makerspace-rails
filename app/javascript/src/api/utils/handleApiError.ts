import { ApiErrorMessageMap } from "app/constants";
import { ApiErrorResponse } from "app/interfaces";
import isString from "lodash-es/isString";
import { isObject } from "util";
import { isUndefined } from "lodash-es";

const defaultMessage = "Unknown Error.  Contact an administrator";
export const handleApiError = (e: any): ApiErrorResponse => {
  const apiErrorResponse: ApiErrorResponse = {
    response: undefined,
    errorMessage: defaultMessage,
  }

  if (isString(e)) {
    console.error(`API Error Recieved: ${e}`);
  } else if (isObject(e) && isObject(e.response)) {
    try {
      const { response: errorResponse } = e;

      const { data: error } = errorResponse;
      apiErrorResponse.response = errorResponse;
      if (isObject(error) && (error.message || error.error)) {
        apiErrorResponse.errorMessage = error.message || error.error;
      }
    } catch (parseError) {
      console.error(`Error handling API Error: ${parseError}`);
    }
  }

  return apiErrorResponse;
};