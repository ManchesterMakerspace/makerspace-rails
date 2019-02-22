/**
 * Main injection point for application.  Webpacker compiles everything in this folder by default.
 */
import "./stylesheets/application";
import { composeWithDevTools } from 'redux-devtools-extension';
import * as React from 'react';
import { createBrowserHistory, History } from "history";
import { applyMiddleware, createStore, Store } from 'redux';
import reduxThunk from "redux-thunk";
import { Provider } from "react-redux";
import * as ReactDOM from 'react-dom';
import { ConnectedRouter, routerMiddleware } from 'connected-react-router';
import { Theme, MuiThemeProvider, createMuiTheme } from '@material-ui/core';

import App from "app/App";

import { State as ReduxState, getRootReducer } from "ui/reducer";


const history: History = createBrowserHistory();
const store: Store<ReduxState> = createStore(
  getRootReducer(history), // new root reducer with router state
  composeWithDevTools(
    applyMiddleware(
      routerMiddleware(history), // for dispatching history actions
      reduxThunk
    ),
  ),
);;
const theme: Theme = createMuiTheme({
  palette: {
    secondary: {
      light: '#9E3321',
      main: '#791100',
      dark: '#510B00',
      contrastText: '#FFF',
    },
  },
});

ReactDOM.render(
  <Provider store={store}>
  { /* ConnectedRouter will use the store from Provider automatically */}
    <ConnectedRouter history={history}>
      <MuiThemeProvider theme={theme}>
        <App/>
      </MuiThemeProvider>
    </ConnectedRouter>
  </Provider>,
  document.body.appendChild(document.createElement('div'))
);
