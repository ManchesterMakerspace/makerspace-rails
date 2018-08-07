/**
 * Main injection point for application.  Webpacker compiles everything in this folder by default.
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { getHistory, getTheme, getStore } from 'app/utils';
import App from "app/App";

const history = getHistory();
const store = getStore();
const theme = getTheme();

ReactDOM.render(
  <App store={store} theme={theme} history={history}/>,
  document.body.appendChild(document.createElement('div'))
);
