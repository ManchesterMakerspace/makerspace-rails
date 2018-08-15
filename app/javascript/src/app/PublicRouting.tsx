import * as React from 'react';
import { Switch, Route } from "react-router";

import NotFound from "ui/common/NotFound";
import LandingPage from 'ui/auth/LandingPage';
import CheckoutContainer from 'ui/checkout/CheckoutContainer';


const PublicRouting: React.SFC<{}> = () => (
  <Switch>
    <Route exact path="/checkout" component={CheckoutContainer} />
    <Route exact path="/" component={LandingPage} />
    <Route component={NotFound} />
  </Switch>
);

export default PublicRouting;