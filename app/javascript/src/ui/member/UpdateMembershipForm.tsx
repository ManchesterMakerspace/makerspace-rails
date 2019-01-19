import * as React from "react";
import { connect } from "react-redux";
import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import MembershipSelectForm from "ui/auth/MembershipSelectForm";
import Form from "ui/common/Form";
import { Subscription } from "app/entities/subscription";
import { readSubscriptionAction } from "ui/subscriptions/actions";


/*
View Current Membership Info
If no subscription, can purchase a membership
When selecting a membership & submitting form, create an invoice, and go to checkout

If subscription, can cancel or change payment method
Need to display notification that can only have one subscription active so if they'd like to change
membership then they need to cancel their current one and select a new one.
Changing methods renders PaymentMethodsContainer w/ managing methods false

*/

interface DispatchProps {
  getSubscription: (id: string) => void;
}
interface OwnProps {
  subscriptionId: string;
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
}

class UpdateMembershipForm extends React.Component<Props, State> {

  public constructor(props: Props) {
    super(props);
    this.state = {
      membershipOptionId: undefined,
      discountId: undefined
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

  public render = () => {
    const { subscription } = this.props;
    const { membershipOptionId, discountId } = this.state;
    return (
      <Form
        id="update-membership-modal"
        title="Change Membership"
      >
        <MembershipSelectForm
          membershipOptionId={membershipOptionId}
          discountId={discountId}
          onSelect={this.onSelect}
          onDiscount={this.onDiscount}
        />
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