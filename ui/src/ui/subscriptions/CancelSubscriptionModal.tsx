import * as React from "react";
import Typography from "@material-ui/core/Typography";

import FormModal from "ui/common/FormModal";
import { isCanceled } from "ui/subscriptions/utils";
import { adminCancelSubscription, cancelSubscription, Subscription } from "makerspace-ts-api-client";
import { useAuthState } from "../reducer/hooks";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { ActionButton } from "../common/ButtonRow";
import useModal from "../hooks/useModal";
import { SubscriptionDetailsInner } from "./SubscriptionDetails";

interface Props {
  subscription: Subscription;
  onSuccess: () => void;
}

const CancelSubscriptionModal: React.FC<Props> = ({ subscription, onSuccess }) => {
  const { currentUser: { id, isAdmin } } = useAuthState();
  const { isOpen, openModal, closeModal } = useModal();
  const asAdmin = isAdmin && id !== subscription.memberId;

  const { isRequesting, error, call } = useWriteTransaction(asAdmin ? adminCancelSubscription : cancelSubscription, () => {
    closeModal();
    onSuccess();
  });

  const onSubmit = React.useCallback(() => {
    call({ id: subscription.id });
  }, [call, subscription.id]);

  const disableButton = isCanceled(subscription);
  const whosSubscription = asAdmin ? (subscription.memberName ? `${subscription.memberName}'s` : "this") : "your";
  return (
    <>
     <ActionButton
        id="subscription-option-cancel"
        color="secondary"
        variant="outlined"
        disabled={disableButton}
        label="Cancel Subscription"
        onClick={openModal}
      />
      {isOpen && (
        <FormModal
          id="cancel-subscription"
          loading={isRequesting}
          isOpen={isOpen}
          closeHandler={closeModal}
          title="Cancel Subscription"
          onSubmit={onSubmit}
          submitText="Submit"
          cancelText="Close"
          error={error}
        >
          <Typography gutterBottom>
            Are you sure you want to cancel {whosSubscription} subscription?  This action cannot be undone.
          </Typography>
          <SubscriptionDetailsInner subscription={subscription} />
        </FormModal>
      )}
    </>
  );
};

export default CancelSubscriptionModal;
