import * as React from 'react';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';
import Typography from '@material-ui/core/Typography';

import { Routing } from "app/constants";
import MembershipSelectForm from 'ui/auth/MembershipSelectForm';
import { Redirect } from 'react-router';

interface State {
  redirect: string;
}
interface OwnProps  {
}
interface StateProps {}
interface DispatchProps {}
interface Props extends OwnProps, StateProps, DispatchProps {}

class LandingPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      redirect: undefined,
    }
  }

  private goToLogin = (_event: React.MouseEvent<HTMLElement>) => {
    this.setState({ redirect: Routing.Login });
  }

  public render(): JSX.Element {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect}/>;
    }
    return (
      <Grid container spacing={24} justify="center">
        <Grid item xs={10}>
          <Card style={{ minWidth: 275 }}>
            <CardContent>
              <Grid container spacing={24}>

                <Grid item md={6} sm={12} style={{ width: '100%', height: '200px' }}>
                  <Grid id="landing-page-graphic"></Grid>
                </Grid>

                <Grid item md={6} sm={12}>
                    <Typography variant="subheading">
                      Manchester Makerspace is a non-profit collaborative organization of members who maintain a shared workspace, tooling, and skills in the Manchester, NH community. We will provide access to shared resources, training, and mentorship for the benefit of Manchester’s local entrepreneurs, makers, and artists of all ages.
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="headline">
                    To get started, first select a membership option.
                  </Typography>
                  <MembershipSelectForm title="" redirectOnSelect={true} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

export default LandingPage;