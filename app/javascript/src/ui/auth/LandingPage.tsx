import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router";

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';

import Login from 'ui/auth/Login';
import { AuthDisplayOption, AuthRouting } from 'ui/auth/constants';
import { Location } from 'history';
import MembershipSelectForm from 'ui/auth/MembershipSelectForm';

interface State {
  authDisplay: AuthDisplayOption;
}
interface OwnProps extends RouteComponentProps<any> {
  defaultView?: AuthDisplayOption;
  location: Location<any>;
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

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    const { history, location } = this.props;
    const { location: oldLocation } = prevProps;
    if (location !== oldLocation) {
      const newDisplay = Object.keys(AuthRouting).find(display => AuthRouting[display] === history.location.pathname) as AuthDisplayOption;
      this.setState({ authDisplay: newDisplay });
    }
  }

  private alignHistory = () => {
    const { history } = this.props;
    const { authDisplay } = this.state;
    if (history.location.pathname !== AuthRouting[authDisplay]) {
      this.props.history.push(AuthRouting[authDisplay]);
    }
  }

  private toggleDisplay = (_event: React.MouseEvent<HTMLElement>, targetDisplay?: AuthDisplayOption) => {
    if (targetDisplay) {
      this.setState({ authDisplay: targetDisplay }, this.alignHistory);
    } else {
      this.setState((state) => {
        const { authDisplay } = state;
        const currentDisplay = authDisplay || this.props.defaultView;
        const newDisplay = Object.values(AuthDisplayOption).find((opt) => opt !== currentDisplay);
        return { authDisplay: newDisplay };
      }, this.alignHistory);
    }
  }

  public render(): JSX.Element {
    const { authDisplay } = this.state;
    const { defaultView } = this.props;

    const display = authDisplay || defaultView;

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
              <Card style={{minWidth: 275}}>
                <CardContent>
                  {display === AuthDisplayOption.Login ?
                    <Login/> :
                    <MembershipSelectForm redirectOnSelect={true}/>
                  }
                </CardContent>
              </Card>
            </Grid>
            <Grid item container xs={12} justify="center" alignItems="center">
              <Button id="auth-toggle" variant="outlined" color="secondary" fullWidth onClick={this.toggleDisplay}>
                {display === AuthDisplayOption.Login ? "Register" : "Already a Member? Login"}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withRouter(LandingPage);