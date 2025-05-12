import * as React from "react";
import { Rental, adminCreateRental, Member } from "makerspace-ts-api-client";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { ActionButton } from "../common/ButtonRow";
import useModal from "../hooks/useModal";
import Form from "../common/Form";
import RentalForm from "./RentalForm";


const CreateRental: React.FC<{ member?: Member; onCreate: (id: string) => void }> = ({ member, onCreate }) => {
  const { isOpen, openModal, closeModal } = useModal();
  const formRef = React.useRef<RentalForm>();

  const onSuccess = React.useCallback(
    ({ response }) => {
      onCreate(response.data.id);
      closeModal();
    },
    [onCreate, closeModal]
  );
  const { isRequesting, error, call: create } = useWriteTransaction(adminCreateRental, onSuccess);

  const onSubmit = React.useCallback(
    async (form: Form) => {
      const validUpdate: Rental = await formRef.current.validate(form);

      if (!form.isValid()) return;

      create({ body: validUpdate });
    },
    [formRef, create]
  );

  return (
    <>
      <ActionButton
        id="rentals-list-create"
        color="primary"
        variant="contained"
        disabled={isRequesting}
        label="Create New Rental"
        onClick={openModal}
      />
      {isOpen && (
        <RentalForm
          ref={formRef}
          isOpen={true}
          rental={(member ? { memberId: member.id, memberName: `${member.firstname} ${member.lastname}` } : {}) as Rental}
          isRequesting={isRequesting}
          error={error}
          onClose={closeModal}
          onSubmit={onSubmit}
          title="Create New Rental"
        />
      )}
    </>
  );
};

export default CreateRental;
