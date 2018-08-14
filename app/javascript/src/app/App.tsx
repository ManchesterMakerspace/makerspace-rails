import * as React from 'react';
import { Store } from 'redux';
import { connect, Provider } from "react-redux";
import { ConnectedRouter } from 'connected-react-router';
import { History } from 'history';

import { Theme, MuiThemeProvider } from '@material-ui/core';

import { ScopedThunkDispatch, State as ReduxState } from "ui/reducer";
import { activeSessionLogin } from "ui/auth/actions";
import Header from "ui/common/Header";
import ProtectedFrame from 'ui/common/ProtectedFrame';
import LandingPage from 'ui/common/LandingPage';

interface StateProps {
  auth: boolean;
}
interface DispatchProps {
  attemptLogin: () => void;
}
interface OwnProps {
  store: Store<ReduxState>,
  history: History,
  theme: Theme,
}

interface Props extends StateProps, DispatchProps, OwnProps { }

class App extends React.Component<Props, {}> {

  public componentDidMount() {
    this.props.attemptLogin();
  }

  public render(): JSX.Element {
    const { auth, store, history, theme } = this.props;

    return (
      <Provider store={store}>
      { /* ConnectedRouter will use the store from Provider automatically */}
      <ConnectedRouter history={history}>
        <MuiThemeProvider theme={theme}>
          <div className="root">
          <Header/>
            {auth ? <ProtectedFrame/> : <LandingPage/>}
          </div>
        </MuiThemeProvider>
      </ConnectedRouter>
    </Provider>
    )
  }
}

const mapStateToProps = (state: ReduxState, _ownProps: OwnProps): StateProps => {
  const {
    auth: { currentUser }
  } = state;

  return {
    auth: currentUser && !!currentUser.email
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    attemptLogin: () => dispatch(activeSessionLogin())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
