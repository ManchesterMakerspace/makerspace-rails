import * as React from 'react';

import { Grid, Card, CardContent, Button, Typography } from '@material-ui/core';

import Login from 'ui/auth/Login';
import SignUpForm from 'ui/auth/SignUpForm';

interface State {
  displayLogin: boolean;
}
interface Props {}

class LandingPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      displayLogin: false
    }
  }

  private toggleDisplay = () => {
    this.setState((state) => ({ displayLogin: !state.displayLogin}));
  }

  render(): JSX.Element {
    const { displayLogin } = this.state;
    return (
      <Grid container spacing={24}>
        <Grid item container xs={6} justify="center" alignItems="center">
          <Typography variant="display1" color="primary" gutterBottom>
            Manchester Makerspace
          </Typography>
        </Grid>


        <Grid xs={6} container justify="center" spacing={24}>
          <Grid item xs={12} justify="center">
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

export default LandingPage;