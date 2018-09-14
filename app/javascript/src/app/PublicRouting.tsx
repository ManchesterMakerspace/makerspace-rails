import * as React from 'react';
import { Switch, Route, Redirect } from "react-router";

import LandingPage from 'ui/auth/LandingPage';
import CheckoutContainer from 'ui/checkout/CheckoutContainer';

enum PublicRoutes {
  Checkout = "/checkout",
  Root = "/"
}
const PublicRouting: React.SFC<{}> = () => {
  // Redirect to root if not authed and somewhere else
  return (
    <Switch >
      <Route exact path={PublicRoutes.Checkout} component={CheckoutContainer} />
      <Route exact path={PublicRoutes.Root} component={LandingPage} />
      <Redirect to="/"/>
    </Switch>
  );
};

export default PublicRouting;