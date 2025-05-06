import * as React from "react";
import { Rental, adminUpdateRental } from "makerspace-ts-api-client";

import useModal from "../hooks/useModal";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { ActionButton } from "ui/common/ButtonRow";
import RentalForm from "./RentalForm";
import Form from "ui/common/Form";

interface Props {
  rental: Rental;
  onUpdate: () => void;
}

const EditRental: React.FC<Props> = ({ rental, onUpdate }) => {
  const { isOpen, openModal, closeModal } = useModal();
  const formRef = React.useRef<RentalForm>();
  const onSuccess = React.useCallback(
    ({ reset }) => {
      onUpdate();
      closeModal();
      reset();
    },
    [onUpdate, closeModal]
  );
  const { call, isRequesting, error } = useWriteTransaction(adminUpdateRental, onSuccess);
  const onSubmit = React.useCallback(async (form: Form) => {
    const validUpdate: Rental = await formRef.current.validate(form);

    if (!form.isValid()) return;

    call({ id: rental.id, body: validUpdate });
  }, [rental, formRef]);

  return (
    <>
      <ActionButton
        id="rentals-list-edit"
        variant="outlined"
        color="primary"
        disabled={!rental}
        onClick={openModal}
        label="Edit Rental"
      />
      {isOpen && (
        <RentalForm
          ref={formRef}
          rental={rental}
          isOpen={true}
          isRequesting={isRequesting}
          error={error}
          onClose={closeModal}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};

export default EditRental;
