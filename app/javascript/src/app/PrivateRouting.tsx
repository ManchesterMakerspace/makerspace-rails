import * as React from 'react';
import { Switch, Route, Redirect } from "react-router-dom";

import { Routing, Whitelists } from "app/constants";
import NotFound from "ui/common/NotFound";
import MembersList from "ui/members/MembersList";
import RentalsList from 'ui/rentals/RentalsList';
import EarnedMembershipsList from 'ui/earnedMemberships/EarnedMembershipsList';
import MemberDetail from 'ui/member/MemberDetail';
import CheckoutContainer from 'ui/checkout/CheckoutContainer';
import BillingContainer from 'ui/billing/BillingContainer';
import SettingsContainer from 'ui/member/Settings';
import BillingContextContainer from 'ui/billing/BillingContextContainer';
import { Permission } from 'app/entities/permission';
import { CollectionOf } from 'app/interfaces';
import SendRegistrationComponent from 'ui/auth/SendRegistrationComponent';

interface Props {
  auth: string,
  permissions: CollectionOf<Permission>,
  isAdmin: boolean;
}
const PrivateRouting: React.SFC<Props> = (props) => {
  const billingEnabled = props.permissions[Whitelists.billing] || false;
  const earnedMembershipEnabled = props.isAdmin && props.permissions[Whitelists.earnedMembership];

  return (
    <BillingContextContainer>
      <Switch>
        <Route exact path={Routing.Members} component={MembersList} />
        <Route exact path={`${Routing.Profile}/${Routing.PathPlaceholder.Resource}${Routing.PathPlaceholder.Optional}`} component={MemberDetail} />
        <Route exact path={Routing.Settings} component={SettingsContainer} />
        <Route exact path={Routing.Rentals} component={RentalsList} />
        {billingEnabled && <Route exact path={`${Routing.Billing}/${Routing.PathPlaceholder.Resource}${Routing.PathPlaceholder.Optional}`} component={BillingContainer} />}
        {billingEnabled && <Route exact path={Routing.Checkout} component={CheckoutContainer} />}
        <Route exact path={Routing.SendRegistration} component={SendRegistrationComponent}/>
        {earnedMembershipEnabled && <Route exact path={Routing.EarnedMemberships} component={EarnedMembershipsList}/>}
        <Redirect to={`${Routing.Members}/${props.auth}`} />
        <Route component={NotFound} />
      </Switch>
    </BillingContextContainer>
  )
};

export default PrivateRouting;