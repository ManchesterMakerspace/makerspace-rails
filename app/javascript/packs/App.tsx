import * as React from 'react';
import { connect } from "react-redux";

import { Switch, Route } from "react-router";
import { ScopedThunkDispatch, State as ReduxState } from "ui/reducer";
import { logoutUserAction, activeSessionLogin } from "ui/auth/actions";
import Header from "ui/common/Header";
import MembersList from "ui/members/MembersList";
import NotFound from "ui/common/NotFound";
import PlansList from 'ui/billing/PlansList';

interface StateProps {
  auth: boolean;
}
interface DispatchProps {
  logout: () => void;
  attemptLogin: () => void;
}

interface Props extends StateProps, DispatchProps { }

class App extends React.Component<Props, {}> {

  public componentDidMount() {
    this.props.attemptLogin();
  }

  public render(): JSX.Element {
    const { auth, logout } = this.props;

    return (
      <div className="root">
        <Header auth={auth} logout={logout} />
        <div>
          <Switch>
            <Route exact path="/" component={MembersList} />
            <Route exact path="/billing" component={PlansList} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: ReduxState, _ownProps: Props): StateProps => {
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
    logout: () => dispatch(logoutUserAction()),
    attemptLogin: () => dispatch(activeSessionLogin())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App) as React.ComponentClass;
