import * as React from "react";
import { rentalToRenewal } from "ui/rentals/utils";
import RenewalForm, { RenewForm } from "ui/common/RenewalForm";
import { adminUpdateRental, Rental } from "makerspace-ts-api-client";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { ActionButton } from "../common/ButtonRow";
import useModal from "../hooks/useModal";
import Form from "../common/Form";


const RenewRental: React.FC<{ rental: Rental, onRenew: () => void }> = ({ rental = {} as Rental, onRenew }) => {
  const { isOpen, openModal, closeModal } = useModal();
  const formRef = React.useRef<RenewalForm>();

  const onSuccess = React.useCallback(({ reset }) => {
    closeModal();
    onRenew();
    reset();
  }, [closeModal]);
  const {
    isRequesting: rentalRenewing,
    error: renewError,
    call: renew,
  } = useWriteTransaction(adminUpdateRental, onSuccess);

  const onSubmit = React.useCallback(
    async (form: Form) => {
      const validUpdate: RenewForm = await formRef.current.validate(form);

      if (!form.isValid()) return;

      // TODO: renew rental type isn't supported
      renew({ id: rental.id, body: validUpdate as unknown as Rental });
    },
    [formRef, renew, rental]
  );

  return (
    <>
      <ActionButton
        id="rentals-list-renew"
        color="primary"
        variant="outlined"
        disabled={!rental.id}
        label="Renew"
        onClick={openModal}
      />
      {isOpen && (
        <RenewalForm
          ref={formRef}
          title="Renew Rental"
          entity={rentalToRenewal(rental)}
          isOpen={true}
          isRequesting={rentalRenewing}
          error={renewError}
          onClose={closeModal}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
}

export default RenewRental;
