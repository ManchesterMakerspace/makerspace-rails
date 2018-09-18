import * as React from 'react';

import { Grid, Card, CardContent, Button, Typography, Hidden } from '@material-ui/core';

import Login from 'ui/auth/Login';
import SignUpForm from 'ui/auth/SignUpForm';
import { AuthDisplayOption } from 'ui/auth/constants';

interface State {
  authDisplay: AuthDisplayOption;
}
interface OwnProps {}
interface StateProps {}
interface DispatchProps {}
interface Props extends OwnProps, StateProps, DispatchProps {}

class LandingPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      authDisplay: AuthDisplayOption.SignUp,
    }
  }

  private toggleDisplay = (_event: React.MouseEvent<HTMLElement>, targetDisplay?: AuthDisplayOption) => {
    if (targetDisplay) {
      this.setState({ authDisplay: targetDisplay });
    } else {
      this.setState((state) => {
        const { authDisplay: currentDisplay } = state;
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
                {authDisplay === AuthDisplayOption.Login ?
                  <Login/> :
                  <SignUpForm goToLogin={this.goToLogin}/>
                }
              </CardContent>
            </Card>
          </Grid>
          <Grid item container xs={12} justify="center" alignItems="center">
            <Button variant="outlined" color="primary" fullWidth onClick={this.toggleDisplay}>
              {authDisplay === AuthDisplayOption.Login ? "Register" : "Already a Member? Login"}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default LandingPage;