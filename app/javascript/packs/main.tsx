/**
 * Main injection point for application.  Webpacker compiles everything in this folder by default.
 */
import "./stylesheets/application";
import * as React from 'react';
import { Store } from 'redux';
import { Provider } from "react-redux";
import * as ReactDOM from 'react-dom';
import { ConnectedRouter } from 'connected-react-router';
import { History } from 'history';
import { Theme, MuiThemeProvider } from '@material-ui/core';

import { getHistory, getTheme, getStore } from 'app/utils';
import App from "app/App";

import { State as ReduxState } from "ui/reducer";


const history: History = getHistory();
const store: Store<ReduxState> = getStore();
const theme: Theme = getTheme();

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
