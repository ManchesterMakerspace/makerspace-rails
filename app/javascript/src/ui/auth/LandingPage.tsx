import * as React from 'react';
import { Redirect } from 'react-router';
import { connect } from "react-redux";

import { Grid, Card, CardContent, Button, Typography, Hidden } from '@material-ui/core';

import { State as ReduxState } from "ui/reducer";
import Login from 'ui/auth/Login';
import SignUpForm from 'ui/auth/SignUpForm';

interface State {
  displayLogin: boolean;
  redirect: boolean;
}
interface OwnProps {
}
interface StateProps {
  auth: boolean;
  isRequesting: boolean;
}
interface DispatchProps {}
interface Props extends OwnProps, StateProps, DispatchProps {}

class LandingPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      displayLogin: false,
      redirect: false,
    }
  }

  public componentDidMount() {
    const { auth } = this.props;
    if (auth) {
      this.setState({ redirect: true });
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;
    const { isRequesting, auth } = this.props;
    if (wasRequesting && !isRequesting && auth) {
      this.setState({ redirect: true });
    }
  }

  private toggleDisplay = () => {
    this.setState((state) => ({ displayLogin: !state.displayLogin}));
  }

  render(): JSX.Element {
    const { displayLogin, redirect } = this.state;
    if (redirect) {
      return <Redirect to="/members" push={true} /> 
    }
    return (
      <Grid container spacing={24}>
      <Hidden smDown>
        <Grid item container md={6} justify="center" alignItems="center">
          <Typography variant="display1" color="primary" gutterBottom>
            Manchester Makerspace
          </Typography>
        </Grid>
        </Hidden>


        <Grid item container md={6} sm={12} justify="center" spacing={24}>
          <Grid item xs={12}>
            <Card style={{minWidth: 275}}>
              <CardContent>
                {displayLogin ?
                  <Login/> :
                  <SignUpForm />
                }
              </CardContent>
            </Card>
          </Grid>
          <Grid item container xs={12} justify="center" alignItems="center">
            <Button variant="outlined" color="primary" fullWidth onClick={this.toggleDisplay}>
              {displayLogin ? "Register" : "Log In"}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    );
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

export default connect(mapStateToProps)(LandingPage);