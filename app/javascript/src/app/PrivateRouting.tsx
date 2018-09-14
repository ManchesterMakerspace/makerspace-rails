import * as React from 'react';
import { Switch, Route } from "react-router";

import NotFound from "ui/common/NotFound";
import MembersList from "ui/members/MembersList";
import PlansList from 'ui/billingPlans/PlansList';
import RentalsList from 'ui/rentals/RentalsList';
import SubscriptionsList from 'ui/subscriptions/SubscriptionsList';
import MemberDetail from 'ui/member/MemberDetail';
import LandingPage from 'ui/auth/LandingPage';


const PrivateRouting: React.SFC<{}> = () => (
  <Switch>
    <Route exact path="/members" component={MembersList} />
    <Route exact path="/members/:memberId/:resource?" component={MemberDetail} />
    <Route exact path="/billing" component={PlansList} />
    <Route exact path="/subscriptions" component={SubscriptionsList} />
    <Route exact path="/rentals" component={RentalsList} />
    <Route exact path="/" component={LandingPage} />
    <Route component={NotFound} />
  </Switch>
);

export default PrivateRouting;