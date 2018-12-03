import * as React from "react";
import { withRouter } from 'react-router-dom';
import { connect } from "react-redux";
import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import Typography from "@material-ui/core/Typography";

import FormModal from "ui/common/FormModal";
import KeyValueItem from "ui/common/KeyValueItem";
import Form from "ui/common/Form";
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
    this.props.getSubscription(subscriptionId || resource.subscriptionId)
  }

  private renderSubscriptionDetails = () => {
    const { subscription } = this.props;
    return (
      <>
        <KeyValueItem label="Member">
          <span id="delete-subscription-member">{subscription.memberName}</span>
        </KeyValueItem>
        <KeyValueItem label="Type">
          <span id="delete-subscription-resource">{`$${subscription.resourceClass}`}</span>
        </KeyValueItem>
        <KeyValueItem label="Status">
          <span id="delete-subscription-status">{`$${subscription.resourceClass}`}</span>
        </KeyValueItem>
        <KeyValueItem label="Next Payment">
          <span id="delete-subscription-next-payment">{timeToDate(subscription.nextBillingDate)}</span>
        </KeyValueItem>
      </>
    )
  }

  private renderResourceDetails = () => {
    const { resource } = this.props;
    const subscriptionType = resource.subscriptionId ? "Automatic Renewal" : "No Subscription Set";
    let expiration;
    if (isMember(resource)) {
      expiration = resource.expirationTime;
    } else if (isRental(resource)) {
      expiration = resource.expiration;
    }

    return (
      <>
        <KeyValueItem label="Subscription">
          <span>{subscriptionType}</span>
        </KeyValueItem>
        <KeyValueItem label="Next Payment Before">
          <span id="delete-subscription-exp-date">{timeToDate(expiration)}</span>
        </KeyValueItem>
      </>
    );
  }

  public render(): JSX.Element {
    const { subscription, isRequesting, error } = this.props;

    return (
      <>
        {isRequesting && <LoadingOverlay id="subscription-detail-loading"/>}
        {subscription ? this.renderSubscriptionDetails() : this.renderResourceDetails()}
        {error && <ErrorMessage error={error} id="subscription-detail-error"/>}
      </>
    );
  }
}

const mapStateToProps = (
  state: ReduxState,
  ownProps: OwnProps
): StateProps => {

  const { subscriptionId } = ownProps;
  const { entities: subscriptions, read: { isRequesting, error } } = state.subscriptions;

  return {
    subscription: subscriptions[subscriptionId],
    isRequesting,
    error
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps,
): DispatchProps => {
  return {
    getSubscription: (id) => dispatch(readSubscriptionAction(id)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubscriptionDetail);
