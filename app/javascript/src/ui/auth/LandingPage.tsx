import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router";

import { Grid, Card, CardContent, Button, Typography, Hidden } from '@material-ui/core';

import { Routing } from "app/constants";
import Login from 'ui/auth/Login';
import SignUpForm from 'ui/auth/SignUpForm';
import { AuthDisplayOption } from 'ui/auth/constants';

interface State {
  authDisplay: AuthDisplayOption;
}
interface OwnProps extends RouteComponentProps<any> {
  defaultView?: AuthDisplayOption;
}
interface StateProps {}
interface DispatchProps {}
interface Props extends OwnProps, StateProps, DispatchProps {}

class LandingPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      authDisplay: undefined,
    }
  }

  public componentDidUpdate(_prevProps: Props, prevState: State): void {
    const { authDisplay: prevDisplay } = prevState;
    const { authDisplay } = this.state;
    if (authDisplay && authDisplay !== prevDisplay) {
      authDisplay === AuthDisplayOption.Login ? this.props.history.push(Routing.Login) : this.props.history.push(Routing.SignUp);
    }
  }

  private toggleDisplay = (_event: React.MouseEvent<HTMLElement>, targetDisplay?: AuthDisplayOption) => {
    if (targetDisplay) {
      this.setState({ authDisplay: targetDisplay });
    } else {
      this.setState((state) => {
        const { authDisplay } = state;
        const currentDisplay = authDisplay || this.props.defaultView;
        const newDisplay = Object.values(AuthDisplayOption).find((opt) => opt !== currentDisplay);
        return { authDisplay: newDisplay };
      });
    }
  }

  private goToLogin = () => {
    this.toggleDisplay(null, AuthDisplayOption.Login);
  }

  public render(): JSX.Element {
    const { authDisplay } = this.state;
    const { defaultView } = this.props;

    const display = authDisplay || defaultView;

    return (
      <Grid container spacing={24}>
        <Hidden smDown>
          <Grid item container md={6} justify="center" alignItems="center">
            <Typography id="landing-page-graphic" variant="display1" color="primary" gutterBottom>
              Manchester Makerspace
            </Typography>
          </Grid>
        </Hidden>


        <Grid item container md={6} sm={12} justify="center" spacing={24}>
          <Grid item xs={12}>
            <Card style={{minWidth: 275}}>
              <CardContent>
                {display === AuthDisplayOption.Login ?
                  <Login/> :
                  <SignUpForm goToLogin={this.goToLogin}/>
                }
              </CardContent>
            </Card>
          </Grid>
          <Grid item container xs={12} justify="center" alignItems="center">
            <Button variant="outlined" color="primary" fullWidth onClick={this.toggleDisplay}>
              {display === AuthDisplayOption.Login ? "Register" : "Already a Member? Login"}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withRouter(LandingPage);