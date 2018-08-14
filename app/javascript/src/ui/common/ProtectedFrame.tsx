import * as React from 'react';
import { Switch, Route } from "react-router";

import NotFound from "ui/common/NotFound";
import MembersList from "ui/members/MembersList";
import PlansList from 'ui/billing/plans/PlansList';
import RentalsList from 'ui/rentals/RentalsList';
import SubscriptionsList from 'ui/billing/subscriptions/SubscriptionsList';


const ProtectedFrame: React.SFC<{}> = () => (
  <Switch>
    <Route exact path="/billing" component={PlansList} />
    <Route exact path="/subscriptions" component={SubscriptionsList} />
    <Route exact path="/members" component={MembersList} />
    <Route exact path="/rentals" component={RentalsList} />
    <Route component={NotFound} />
  </Switch>
);

export default ProtectedFrame;