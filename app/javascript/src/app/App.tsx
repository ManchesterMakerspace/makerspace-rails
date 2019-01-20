import * as React from 'react';
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router";
import isEmpty from 'lodash-es/isEmpty';

import { ScopedThunkDispatch, State as ReduxState } from "ui/reducer";
import { activeSessionLogin } from "ui/auth/actions";
import Header from "ui/common/Header";
import LoadingOverlay from 'ui/common/LoadingOverlay';
import PrivateRouting from 'app/PrivateRouting';
import PublicRouting from 'app/PublicRouting';
import { CollectionOf } from 'app/interfaces';
import { Invoice } from 'app/entities/invoice';

interface StateProps {
  auth: string;
  isSigningIn: boolean;
  stagedInvoices: CollectionOf<Invoice>;
  isCheckingOut: boolean;
  checkoutError: string;
}
interface DispatchProps {
  attemptLogin: () => void;
}
interface OwnProps extends RouteComponentProps<any> {}

interface State {
  attemptingLogin: boolean;
  allowPrivate: boolean;
  transitionBlocked: boolean;
}

interface Props extends StateProps, DispatchProps, OwnProps { }

class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      attemptingLogin: true,
      allowPrivate: false,
      transitionBlocked: false,
    }
  }

  public componentDidMount() {
    this.setState({ attemptingLogin: true });
    this.props.attemptLogin();
  }

  public componentDidUpdate(prevProps: Props) {
    const { isSigningIn: wasSigningIn, auth: oldAuth, isCheckingOut: wasCheckingOut } = prevProps;
    const { isSigningIn, auth, stagedInvoices, isCheckingOut, checkoutError } = this.props;

    const { attemptingLogin, transitionBlocked } = this.state;
    if (wasSigningIn && !isSigningIn && attemptingLogin) {
      this.setState({ attemptingLogin: false});
    }
    if (!oldAuth && auth) {
      // Don't switch auth if staged invoices exist
      // This would happen if someone signed up during an auth flow (ie purchasing init membership)
      if (!stagedInvoices || isEmpty(stagedInvoices)) {
        this.setState({ allowPrivate: true })
      } else {
        // Set blocked bool for later eval
        this.setState({ allowPrivate: false, transitionBlocked: true });
      }
    }
    // Restrict routing on logout
    if (oldAuth && !auth) {
      this.setState({ allowPrivate: false });
    }

    if (wasCheckingOut && !isCheckingOut && !checkoutError && transitionBlocked) {
      // Allow private routing if completed checkout successfully after being blocked
      this.setState({ allowPrivate: true });
    }
  }

  private renderBody = ():JSX.Element => {
    const { attemptingLogin, allowPrivate } = this.state;
    const { auth } = this.props;
    if (attemptingLogin) {
      return <LoadingOverlay id="body"/>;
    } else {
      return allowPrivate ? <PrivateRouting auth={auth} /> : <PublicRouting location={this.props.location}/>;
    }
  }
  public render(): JSX.Element {
    return (
      <div className="root">
        <Header/>
        {this.renderBody()}
      </div>
    )
  }
}

const mapStateToProps = (state: ReduxState, _ownProps: OwnProps): StateProps => {
  const {
    auth: { currentUser, isRequesting: isSigningIn },
    checkout: { invoices }
  } = state;

  const {
    isRequesting: isCheckingOut,
    error: checkoutError
  } = state.checkout;

  return {
    auth: currentUser.id,
    stagedInvoices: invoices,
    isSigningIn,
    isCheckingOut,
    checkoutError
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    attemptLogin: () => dispatch(activeSessionLogin())
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
