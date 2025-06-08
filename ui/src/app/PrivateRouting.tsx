import * as React from 'react';
import { Switch, Route, Redirect } from "react-router-dom";

import { Routing, Whitelists } from "app/constants";
import NotFound from "ui/common/NotFound";
import MembersList from "ui/member/MembersList";
import RentalsList from 'ui/rentals/RentalsList';
import EarnedMembershipsList from 'ui/earnedMemberships/EarnedMembershipsList';
import MemberDetail from 'ui/member/MemberDetail';
import CheckoutPage from 'ui/checkout/CheckoutPage';
import BillingContainer from 'ui/billing/BillingContainer';
import SettingsContainer from 'ui/settings/SettingsContainer';
import Receipt from 'ui/checkout/Receipt';
import { Permission } from 'app/entities/permission';
import { CollectionOf } from 'app/interfaces';
import SendRegistrationComponent from 'ui/auth/SendRegistrationComponent';
import AgreementContainer from 'ui/documents/AgreementsContainer';
import UnsubscribeEmails from "ui/member/UnsubscribeEmails";
import { SignUpWorkflow } from 'pages/registration/SignUpWorkflow/SignUpWorkflow';

interface Props {
  currentUserId: string,
  permissions: CollectionOf<Permission>,
  isAdmin: boolean;
}
const PrivateRouting: React.SFC<Props> = ({ currentUserId, permissions, isAdmin }) => {
  const billingEnabled = permissions[Whitelists.billing] || false;
  const earnedMembershipEnabled = isAdmin && permissions[Whitelists.earnedMembership];

  return (
    <Switch>
      <Route exact path={Routing.Members} component={MembersList} />
      <Route exact path={`${Routing.Documents}`} component={AgreementContainer} />
      <Route exact path={Routing.SignUp} component={SignUpWorkflow}/>
      <Route exact path={`${Routing.Settings}/${Routing.PathPlaceholder.Resource}${Routing.PathPlaceholder.Optional}`} component={SettingsContainer} />
      <Route exact path={`${Routing.Profile}/${Routing.PathPlaceholder.Resource}${Routing.PathPlaceholder.Optional}`} component={MemberDetail} />
      <Route exact path={Routing.Rentals} component={RentalsList} />
      {billingEnabled && <Route exact path={`${Routing.Billing}/${Routing.PathPlaceholder.Resource}${Routing.PathPlaceholder.Optional}`} component={BillingContainer} />}
      {billingEnabled && <Route exact path={Routing.Receipt} component={Receipt}/>}
      {billingEnabled && <Route path={Routing.Checkout} component={CheckoutPage} />}
      <Route exact path={Routing.SendRegistration} component={SendRegistrationComponent}/>
      {earnedMembershipEnabled && <Route exact path={Routing.EarnedMemberships} component={EarnedMembershipsList}/>}
      <Route exact path={Routing.Unsubscribe} component={UnsubscribeEmails} />
      <Redirect to={`${Routing.Members}/${currentUserId}`} />
      <Route component={NotFound} />
    </Switch>
  )
};

export default PrivateRouting;
