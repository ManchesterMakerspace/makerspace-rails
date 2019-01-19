import * as React from "react";
import { connect } from "react-redux";
import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";

import KeyValueItem from "ui/common/KeyValueItem";
import { timeToDate } from "ui/utils/timeToDate";
import { Subscription } from "app/entities/subscription";
import { MemberDetails, isMember } from "app/entities/member";
import { readSubscriptionAction } from "ui/subscriptions/actions";
import LoadingOverlay from "ui/common/LoadingOverlay";
import ErrorMessage from "ui/common/ErrorMessage";
import { Rental, isRental } from "app/entities/rental";

interface DispatchProps {
  getSubscription: (id: string) => void;
}

interface OwnProps {
  resource: Partial<MemberDetails | Rental>;
  subscriptionId?: string;
}

interface StateProps {
  subscription: Subscription;
  isRequesting: boolean;
  error: string;
}

interface Props extends OwnProps, DispatchProps, StateProps {}

class SubscriptionDetail extends React.Component<Props, {}> {
  public componentDidMount() {
    const { subscriptionId, resource } = this.props;
    const subId = subscriptionId || resource.subscriptionId;
    subId && this.props.getSubscription(subId);
  }

  private renderSubscriptionDetails = () => {
    const { subscription } = this.props;
    return (
      <>
        <KeyValueItem label="Member">
          <span id="subscription-member">{subscription.memberName}</span>
        </KeyValueItem>
        <KeyValueItem label="Type">
          <span id="subscription-resource">{`${subscription.resourceClass}`}</span>
        </KeyValueItem>
        <KeyValueItem label="Status">
          <span id="subscription-status">{`${subscription.resourceClass}`}</span>
        </KeyValueItem>
        <KeyValueItem label="Next Payment">
          <span id="subscription-next-payment">{timeToDate(subscription.nextBillingDate)}</span>
        </KeyValueItem>
      </>
    )
  }

  public render(): JSX.Element {
    const { subscription, isRequesting, error } = this.props;

    return isRequesting ?
      <LoadingOverlay id="subscription-detail-loading" contained={true} />
      : (
        <>
          {subscription && this.renderSubscriptionDetails()}
          {error && <ErrorMessage error={error} id="subscription-detail-error"/>}
        </>
      );
  }
}

const mapStateToProps = (
  state: ReduxState,
  ownProps: OwnProps
): StateProps => {

  const { subscriptionId, resource } = ownProps;
  const { entities: subscriptions, read: { isRequesting, error } } = state.subscriptions;

  const subscription = subscriptions[subscriptionId || resource.subscriptionId];
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

export default connect(mapStateToProps, mapDispatchToProps)(SubscriptionDetail);
