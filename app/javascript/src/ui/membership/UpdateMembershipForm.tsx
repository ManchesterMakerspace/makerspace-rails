import * as React from "react";
import { connect } from "react-redux";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import MembershipSelectForm from "ui/membership/MembershipSelectForm";
import Form from "ui/common/Form";
import { Subscription } from "app/entities/subscription";
import { readSubscriptionAction } from "ui/subscriptions/actions";
import KeyValueItem from "ui/common/KeyValueItem";
import { displayMemberExpiration } from "ui/member/utils";
import { AuthMember } from "ui/auth/interfaces";
import LoadingOverlay from "ui/common/LoadingOverlay";
import MemberStatusLabel from "ui/member/MemberStatusLabel";

/*
View Current Membership Info
If no subscription, can purchase a membership
When selecting a membership & submitting form, create an invoice, and go to checkout

If subscription, can cancel or change payment method
Need to display notification that can only have one subscription active so if they'd like to change
membership then they need to cancel their current one and select a new one.
Changing methods renders PaymentMethodsContainer w/ managing methods false

*/

const membershipDetails = {
  none: {
    description: "No membership on file. Create a membership to add one.",
    type: "No membership found",
    allowMod: true,
  },
  paypal: {
    description: "Membership handled by PayPal. Contact an administrator for details.",
    type: "Managed by PayPal",
    allowMod: false,
  },
  notFound: {
    description: "Membership subscription cannot be found. Contact an administrator for assistance.",
    type: "Unknown",
    allowMod: false,
  },
  noSubscription: {
    description: "No subscription found. Update membership to enable automatic renewals.",
    type: "Month-to-month",
    allowMod: true,
  },
}

interface DispatchProps {
  getSubscription: (id: string) => void;
}
interface OwnProps {
  subscriptionId: string;
  member: AuthMember;
}
interface StateProps {
  subscription: Subscription;
  isRequesting: boolean;
  error: string;
}
interface Props extends OwnProps, StateProps, DispatchProps {}
interface State {
  membershipOptionId: string;
  discountId: string;
  openMembershipSelect: boolean;
}

class UpdateMembershipForm extends React.Component<Props, State> {

  public constructor(props: Props) {
    super(props);
    this.state = {
      membershipOptionId: undefined,
      discountId: undefined,
      openMembershipSelect: false,
    }
  }

  public componentDidMount() {
    const { subscriptionId } = this.props;
    subscriptionId && this.props.getSubscription(subscriptionId);
  }

  private onSelect = () => {

  }

  private onDiscount = () => {

  }

  private openMembershipSelect = () => this.setState({ openMembershipSelect: true });
  private closeMembershipSelect = () => this.setState({ openMembershipSelect: false });

  private renderSubscriptionDetails = () => {
    const { subscription } = this.props;

    return (
      <Grid container spacing={24}>
        <Grid item xs={12}>
          <Button variant="contained" onClick={this.openMembershipSelect}>Update Membership</Button>
        </Grid>
      </Grid>
    )
  }
  private renderMembershipDetails = () => {
    const { member, subscription } = this.props;

    let details = membershipDetails.noSubscription;
    if (member.subscription && !member.subscriptionId) {
      details = membershipDetails.paypal;
    } else if (member.subscriptionId && !subscription) {
      details = membershipDetails.notFound;
    } else if (!member.expirationTime) {
      details = membershipDetails.none;
    }

    return (
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <KeyValueItem label="Membership Expiration">
            <span id="member-detail-expiration">{displayMemberExpiration(member)}</span>
          </KeyValueItem>
          <KeyValueItem label="Membership Status">
            <MemberStatusLabel id="member-detail-status" member={member} />
          </KeyValueItem>
          <KeyValueItem label="Membership Type">
            <span id="member-detail-type">{details.type}</span>
          </KeyValueItem>
        </Grid>
        <Grid item xs={12}>
          <Typography>{details.description}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" disabled={!details.allowMod} onClick={this.openMembershipSelect}>{member.expirationTime ? "Update Membership" : "Create Membership"}</Button>
        </Grid>
      </Grid>
    );
  }

  private renderMembershipSelect = () => {
    const { membershipOptionId, discountId } = this.state;
    const { openMembershipSelect } = this.state;
    return (openMembershipSelect &&
      <>
        <Typography>Select a membership option to continue.</Typography>
        <MembershipSelectForm
          subscriptionOnly={true}
          membershipOptionId={membershipOptionId}
          discountId={discountId}
          onSelect={this.onSelect}
          onDiscount={this.onDiscount}
        />
      </>
   )
  }

  public render = () => {
    const { subscription, isRequesting } = this.props;
    return (
      <Form
        id="update-membership-modal"
        title="Membership"
      >
        {isRequesting ? <LoadingOverlay id="update-membership-modal-loading" contained={true}/>
          : (subscription ? this.renderSubscriptionDetails() : this.renderMembershipDetails())
        }
        {this.renderMembershipSelect()}
      </Form>
    )
  }
}


const mapStateToProps = (
  state: ReduxState,
  ownProps: OwnProps
): StateProps => {

  const { subscriptionId } = ownProps;
  const { entities: subscriptions, read: { isRequesting, error } } = state.subscriptions;

  const subscription = subscriptions[subscriptionId];
  return {
    subscription,
    isRequesting,
    error
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  _ownProps: OwnProps,
): DispatchProps => {
  return {
    getSubscription: (id) => dispatch(readSubscriptionAction(id)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateMembershipForm);