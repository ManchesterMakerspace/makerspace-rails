import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createBrowserHistory } from "history";
import { applyMiddleware, createStore, Store } from 'redux';
import reduxThunk from "redux-thunk";
import { Provider } from "react-redux";
import { connectRouter, routerMiddleware, ConnectedRouter } from 'connected-react-router';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';
import { composeWithDevTools } from 'redux-devtools-extension';

import { rootReducer } from 'ui/reducer';
import { State as ReduxState } from "ui/reducer";
import App from 'app/App';

const init = () => {
  const history = createBrowserHistory();
  const store: Store<ReduxState> = createStore(
    connectRouter(history)(rootReducer), // new root reducer with router state
    composeWithDevTools(
      applyMiddleware(
        routerMiddleware(history), // for dispatching history actions
        reduxThunk
      ),
    ),
  )

  const theme = createMuiTheme({
    palette: {
      primary: {
        light: '#9E3321',
        main: '#791100',
        dark: '#510B00',
        contrastText: '#FFF',
      },
    },
  });

  ReactDOM.render(
    <Provider store={store}>
      { /* ConnectedRouter will use the store from Provider automatically */ }
      <ConnectedRouter history={history}>
        <MuiThemeProvider theme={theme}>
          <App />
        </MuiThemeProvider>
      </ConnectedRouter>
    </Provider>,
    document.body.appendChild(document.createElement('div'))
  )
}

init();
