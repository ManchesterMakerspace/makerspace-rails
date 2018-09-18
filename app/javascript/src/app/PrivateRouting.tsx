import * as React from 'react';
import { Switch, Route } from "react-router";

import { Routing } from "app/constants";
import NotFound from "ui/common/NotFound";
import MembersList from "ui/members/MembersList";
import PlansList from 'ui/billingPlans/PlansList';
import RentalsList from 'ui/rentals/RentalsList';
import SubscriptionsList from 'ui/subscriptions/SubscriptionsList';
import MemberDetail from 'ui/member/MemberDetail';
import LandingPage from 'ui/auth/LandingPage';


const PrivateRouting: React.SFC<{}> = () => (
  <Switch>
    <Route exact path={Routing.Members} component={MembersList} />
    <Route exact path={`${Routing.Profile}/${Routing.PathPlaceholder.Resource}${Routing.PathPlaceholder.Optional}`} component={MemberDetail} />
    <Route exact path={Routing.Billing} component={PlansList} />
    <Route exact path={Routing.Subscriptions} component={SubscriptionsList} />
    <Route exact path={Routing.Rentals} component={RentalsList} />
    <Route exact path={Routing.Root} component={LandingPage} />
    <Route component={NotFound} />
  </Switch>
);

export default PrivateRouting;