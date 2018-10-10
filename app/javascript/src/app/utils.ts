import { createBrowserHistory, History } from "history";
import { applyMiddleware, createStore, Store } from 'redux';
import reduxThunk from "redux-thunk";
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createMuiTheme, Theme } from '@material-ui/core';
import { composeWithDevTools } from 'redux-devtools-extension';

import { rootReducer } from 'ui/reducer';
import { State as ReduxState } from "ui/reducer";
import { ApiErrorMessageMap } from "app/constants";
import { ApiErrorResponse } from "app/interfaces";

const basePath = (process as any).env.API_DOMAIN || 'localhost';
export const buildJsonUrl = (pathFragments: string | string[], includeBase: boolean = true) => {
  let path: string = includeBase ? `${basePath}/` : "";
  if (Array.isArray(pathFragments)) {
    path += pathFragments.join("/");
  } else {
    path += pathFragments;
  }
  return `${path}.json`;
};

export const emailValid = (email: string): boolean => {
  return (/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i).test(email);
};

export const handleApiError = (e: any): ApiErrorResponse => {
  const { response: errorResponse } = e;
  // Always capture original response for upstream handlers
  let apiErrorResponse: ApiErrorResponse = {
    response: errorResponse,
  }
  let errorMessage = "";
  if (apiErrorResponse.response.data && apiErrorResponse.response.data.error) {
    errorMessage = errorResponse.data.error;
  } else {
    errorMessage = ApiErrorMessageMap[apiErrorResponse.response.status] ||
      "Unknown Error.  Contact an administrator";
  }

  apiErrorResponse = {
    ...apiErrorResponse,
    errorMessage
  }
  return apiErrorResponse;
};

let store: Store<ReduxState>;
let history: History;
let theme: Theme;

export const getStore = () => {
  if (store) return store;
  store = createStore(
    connectRouter(history)(rootReducer), // new root reducer with router state
    composeWithDevTools(
      applyMiddleware(
        routerMiddleware(history), // for dispatching history actions
        reduxThunk
      ),
    ),
  );
  return store;
}

export const getHistory = () => {
  if (history) return history;
  history = createBrowserHistory();
  return history;
}

export const getTheme = () => {
  if (theme) return theme;
  theme = createMuiTheme({
    palette: {
      primary: {
        light: '#9E3321',
        main: '#791100',
        dark: '#510B00',
        contrastText: '#FFF',
      },
    },
  });
  return theme;
}
