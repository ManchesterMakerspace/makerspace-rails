import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import { ConnectedRouter } from 'connected-react-router';
import { MuiThemeProvider } from '@material-ui/core';

import { getHistory, getTheme, getStore } from 'app/utils';
import App from "./App";

const history = getHistory();
const store = getStore();
const theme = getTheme();

ReactDOM.render(
  <Provider store={store}>
    { /* ConnectedRouter will use the store from Provider automatically */}
    <ConnectedRouter history={history}>
      <MuiThemeProvider theme={theme}>
        <App />
      </MuiThemeProvider>
    </ConnectedRouter>
  </Provider>,
  document.body.appendChild(document.createElement('div'))
);
