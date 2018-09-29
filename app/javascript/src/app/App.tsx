import * as React from 'react';
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router";

import { ScopedThunkDispatch, State as ReduxState } from "ui/reducer";
import { activeSessionLogin } from "ui/auth/actions";
import Header from "ui/common/Header";
import LoadingOverlay from 'ui/common/LoadingOverlay';
import PrivateRouting from 'app/PrivateRouting';
import PublicRouting from 'app/PublicRouting';

interface StateProps {
  auth: string;
  isRequesting: boolean;
}
interface DispatchProps {
  attemptLogin: () => void;
}
interface OwnProps extends RouteComponentProps<any> {}

interface State {
  attemptingLogin: boolean;
}

interface Props extends StateProps, DispatchProps, OwnProps { }

class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      attemptingLogin: true,
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
      this.setState({ attemptingLogin: false});
    }
  }

  private renderBody = ():JSX.Element => {
    const { attemptingLogin } = this.state;
    const { auth } = this.props;
    if (attemptingLogin) {
      return <LoadingOverlay id="body"/>;
    } else {
      return auth ? <PrivateRouting auth={auth} /> : <PublicRouting/>;
    }
  }
  public render(): JSX.Element {
    console.log(this.props.location);
    return (
      <div className="root">
        <Header location={this.props.location}/>
        {this.renderBody()}
      </div>
    )
  }
}

const mapStateToProps = (state: ReduxState, _ownProps: OwnProps): StateProps => {
  const {
    auth: { currentUser, isRequesting }
  } = state;

  return {
    auth: currentUser.id,
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
