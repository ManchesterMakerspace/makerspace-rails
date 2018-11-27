import * as React from 'react';
import { Redirect } from "react-router";

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';

import LoginForm from "ui/auth/LoginForm";
import { Routing } from 'app/constants';

interface State {
  redirect: string;
}
class LoginPage extends React.Component<{}, State> {
  public constructor(props: {}) {
    super(props);
    this.state = {
      redirect: undefined,
    }
  }
  private goToRegister = () => {
    this.setState({ redirect: Routing.Root });
  }
  public render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect}/>
    }
    return (
      <Grid container spacing={24}>
        <Hidden smDown>
          <Grid item md={6} sm={12} style={{ padding: '3em', height: '350px' }}>
            <Grid id="landing-page-graphic"></Grid>
          </Grid>
        </Hidden>

        <Grid item md={6} sm={12}>
          <Grid container justify="center" spacing={24}>
            <Grid item xs={12}>
              <Card style={{ minWidth: 275 }}>
                <CardContent>
                  <LoginForm/>
                </CardContent>
              </Card>
            </Grid>
            <Grid item container xs={12} justify="center" alignItems="center">
              <Button id="auth-toggle" variant="outlined" color="secondary" fullWidth onClick={this.goToRegister}>
                Register
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

export default LoginPage;