import * as React from 'react';
import { Switch, Route, Redirect } from "react-router";

import { Routing } from "app/constants";
import LandingPage from 'ui/auth/LandingPage';
import CheckoutContainer from 'ui/checkout/CheckoutContainer';

const PublicRouting: React.SFC<{}> = () => {
  // Redirect to root if not authed and somewhere else
  return (
    <Switch >
      <Route exact path={Routing.Checkout} component={CheckoutContainer} />
      <Route exact path={Routing.Root} component={LandingPage} />
      <Redirect to="/"/>
    </Switch>
  );
};

export default PublicRouting;