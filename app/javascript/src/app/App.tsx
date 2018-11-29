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
  isRequesting: boolean;
  stagedInvoices: CollectionOf<Invoice>;
}
interface DispatchProps {
  attemptLogin: () => void;
}
interface OwnProps extends RouteComponentProps<any> {}

interface State {
  attemptingLogin: boolean;
  allowPrivate: boolean;
}

interface Props extends StateProps, DispatchProps, OwnProps { }

class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      attemptingLogin: true,
      allowPrivate: false,
    }
  }

  public componentDidMount() {
    this.setState({ attemptingLogin: true });
    this.props.attemptLogin();
  }

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting, auth: oldAuth } = prevProps;
    const { isRequesting, auth, stagedInvoices } = this.props;

    const { attemptingLogin } = this.state;
    if (wasRequesting && !isRequesting && attemptingLogin) {
      this.setState({ attemptingLogin: false});
    }
    if (!oldAuth && auth) {
      // Don't switch auth if staged invoices exist
      // This would happen if someone signed up during an auth flow (ie purchasing init membership)
      this.setState({ allowPrivate: (!stagedInvoices || isEmpty(stagedInvoices)) })
    }
    // Restrict routing on logout
    if (oldAuth && !auth) {
      this.setState({ allowPrivate: false });
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
    auth: { currentUser, isRequesting },
    checkout: { invoices }
  } = state;

  return {
    auth: currentUser.id,
    stagedInvoices: invoices,
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
