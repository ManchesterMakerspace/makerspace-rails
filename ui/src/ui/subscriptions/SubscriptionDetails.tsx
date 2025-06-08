import * as React from "react";
import { useDispatch } from "react-redux";
import { getSubscription, Invoice, Subscription } from "makerspace-ts-api-client";
import Grid from "@material-ui/core/Grid";

import KeyValueItem from "ui/common/KeyValueItem";
import useReadTransaction from "../hooks/useReadTransaction";
import { timeToDate } from "../utils/timeToDate";
import { renderPlanType, isCanceled } from "./utils";
import ChangePaymentMethodModal from "../membership/ChangePaymentMethodModal";
import CancelSubscriptionModal from "./CancelSubscriptionModal";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { sessionLoginUserAction } from "ui/auth/actions";
import ErrorMessage from "ui/common/ErrorMessage";
import { useAuthState } from "../reducer/hooks";
import NoSubscriptionDetails from "../subscriptions/NoSubscriptionDetails";

export const SubscriptionDetailsInner: React.FC<{ subscription: Subscription, invoice?: Invoice}> = ({ invoice, subscription }) => {
  const type = subscription && renderPlanType(subscription.planId);

  if (!subscription?.id) {
    return null;
  }
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <KeyValueItem label="Amount">
          <span id="subscription-amount">{numberAsCurrency(subscription.amount)}</span>
        </KeyValueItem>
        <KeyValueItem label="Status">
          <span id="subscription-status">{`${subscription.status}`}</span>
        </KeyValueItem>
        {type && <KeyValueItem label="Type">
          <span id="subscription-type">{type}</span>
        </KeyValueItem>}
        {!isCanceled(subscription) && (
          <KeyValueItem label="Next Payment">
            <span id="subscription-next-payment">{timeToDate(subscription.nextBillingDate)}</span>
          </KeyValueItem>
        )}
      </Grid>
    </Grid>
  )
}

interface Props {
  subscriptionId: string;
  onLoad: (loadState: boolean) => void;
}

const SubscriptionDetails: React.FC<Props> = ({ subscriptionId, onLoad }) => {
  const { currentUser } = useAuthState();
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);
  const [wasCancelled, setWasCancelled] = React.useState(false);

  const { 
    isRequesting: subscriptionLoading, 
    data: subscription = {} as Subscription, 
    error: subError, 
    refresh: reloadSubscription 
  } = useReadTransaction(getSubscription, { id: subscriptionId }, !subscriptionId);
  const dispatch = useDispatch();

  React.useEffect(() => {
    isMounted && onLoad(subscriptionLoading);
  }, [subscriptionLoading]);

  const onChange = React.useCallback(() => {
    subscription.resourceClass === "Member" && dispatch(sessionLoginUserAction());
    reloadSubscription();
  }, [subscription, dispatch, reloadSubscription]);

  return !subscriptionId || wasCancelled || isCanceled(subscription) ? <NoSubscriptionDetails member={currentUser}/> : (
    <>
      <SubscriptionDetailsInner subscription={subscription} />
      <ErrorMessage error={subError} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ChangePaymentMethodModal
            subscription={subscription}
            onSuccess={onChange}
          />
          <CancelSubscriptionModal
            subscription={subscription}
            onSuccess={() => { setWasCancelled(true); onChange(); }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default SubscriptionDetails;
