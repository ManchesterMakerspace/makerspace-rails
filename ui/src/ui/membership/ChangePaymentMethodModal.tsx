import * as React from "react";

import FormModal from "ui/common/FormModal";
import { updateSubscription, Subscription } from "makerspace-ts-api-client";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { ActionButton } from "../common/ButtonRow";
import useModal from "../hooks/useModal";
import PaymentMethodsContainer from "../checkout/PaymentMethodsContainer";
import { AnyPaymentMethod } from "app/entities/paymentMethod";

interface Props {
  subscription: Subscription;
  onSuccess?(): void;
}

const ChangePaymentMethodModal: React.FC<Props> = ({ subscription: { id: subscriptionId, paymentMethodToken } = {} }) => {
  const { isOpen, openModal, closeModal } = useModal();
  const [paymentMethodId, setPaymentMethodId] = React.useState<string>(paymentMethodToken);

  React.useEffect(() => {
    setPaymentMethodId(paymentMethodToken);
  }, [paymentMethodToken]);

  const { isRequesting, error, call } = useWriteTransaction(updateSubscription, () => {
    closeModal();
  });

  const onSubmit = React.useCallback(async () => {
    paymentMethodId && call({ id: subscriptionId, body: { paymentMethodToken: paymentMethodId }});
  }, [call, subscriptionId, paymentMethodId]);

  const setPaymentMethod = React.useCallback((pm: AnyPaymentMethod) => {
    setPaymentMethodId(pm.id);
  }, []);

  if (!subscriptionId) {
    return null;
  }

  return (
    <>
      <ActionButton
        id="subscription-option-payment-method"
        color="primary"
        variant="contained"
        disabled={isRequesting || !!error}
        label="Change Payment Method"
        onClick={openModal}
      />
      {isOpen && (
        <FormModal
          id="change-payment-method"
          isOpen={true}
          closeHandler={closeModal}
          onSubmit={onSubmit}
          loading={isRequesting}
          error={error}
        >
          <PaymentMethodsContainer
            onPaymentMethodChange={setPaymentMethod}
            title="Select or add a new payment method"
            paymentMethodToken={paymentMethodId}
          />
        </FormModal>
      )}
    </>
  );
};

export default ChangePaymentMethodModal;
