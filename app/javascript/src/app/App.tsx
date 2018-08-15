import * as React from 'react';
import { Store } from 'redux';
import { connect, Provider } from "react-redux";
import { ConnectedRouter } from 'connected-react-router';
import { History } from 'history';

import { Theme, MuiThemeProvider } from '@material-ui/core';

import Routing from 'app/Routing';

import { ScopedThunkDispatch, State as ReduxState } from "ui/reducer";
import { activeSessionLogin } from "ui/auth/actions";
import Header from "ui/common/Header";
import LandingPage from 'ui/auth/LandingPage';
import LoadingOverlay from 'ui/common/LoadingOverlay';

interface StateProps {
  auth: boolean;
  isRequesting: boolean;
}
interface DispatchProps {
  attemptLogin: () => void;
}
interface OwnProps {
  store: Store<ReduxState>,
  history: History,
  theme: Theme,
}

interface State {
  attemptingLogin: boolean;
}

interface Props extends StateProps, DispatchProps, OwnProps { }

class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      attemptingLogin: false
    }
  }

  public componentDidMount() {
    this.setState({ attemptingLogin: true });
    this.props.attemptLogin();
  }

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;
    const { isRequesting } = this.props;

    const { attemptingLogin } = this.state;
    if (wasRequesting && !isRequesting && attemptingLogin) {
      this.setState({ attemptingLogin: false });
    }
  }

  private renderBody = ():JSX.Element => {
    const { attemptingLogin } = this.state;
    const { auth } = this.props;
    if (attemptingLogin) {
      return <LoadingOverlay id="body"/>;
    } else {
      return auth ? <Routing/> : <LandingPage/>;
    }
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
              {this.renderBody()}
            </div>
          </MuiThemeProvider>
        </ConnectedRouter>
      </Provider>
    )
  }
}

const mapStateToProps = (state: ReduxState, _ownProps: OwnProps): StateProps => {
  const {
    auth: { currentUser, isRequesting }
  } = state;

  return {
    auth: currentUser && !!currentUser.email,
    isRequesting
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
