import * as React from 'react';
import { Switch, Route, Redirect } from "react-router";

import { Routing } from "app/constants";
import LandingPage from 'ui/auth/LandingPage';
import CheckoutContainer from 'ui/checkout/CheckoutContainer';
import PasswordReset from 'ui/auth/PasswordReset';
import { Location } from 'history';
import SignUpContainer from 'ui/auth/SignUpContainer';
import LoginPage from 'ui/auth/LoginPage';

const PublicRouting: React.SFC<{ location: Location<any> }> = () => {
  // Redirect to root if not authed and somewhere else
  return (
    <Switch >
      <Route exact path={`${Routing.PasswordReset}/:token`} component={PasswordReset} />
      <Route exact path={Routing.Checkout} component={CheckoutContainer} />
      <Route exact path={Routing.Login} component={LoginPage}/>
      <Route exact path={Routing.SignUp} component={SignUpContainer}/>
      <Route exact path={Routing.Root} component={LandingPage} />
      <Redirect to="/"/>
    </Switch>
  );
};

export default PublicRouting;