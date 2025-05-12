import * as React from "react";
import Typography from "@material-ui/core/Typography";
import { adminDeleteRental } from "makerspace-ts-api-client";

import FormModal from "ui/common/FormModal";
import KeyValueItem from "ui/common/KeyValueItem";
import { Rental } from "makerspace-ts-api-client";
import useModal from "../hooks/useModal";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { ActionButton } from "ui/common/ButtonRow";


interface Props {
  rental: Rental;
  onDelete?: () => void;
}

const DeleteRentalModal: React.FC<Props> = ({ rental, onDelete }) => {
  const { isOpen, openModal, closeModal } = useModal();
  const onSuccess = React.useCallback(({ reset }) => {
    onDelete();
    closeModal();
    reset();
  }, [onDelete, closeModal]);
  const { call, isRequesting, error } = useWriteTransaction(adminDeleteRental, onSuccess);
  const onSubmit = React.useCallback(() => {
    rental && call({ id: rental.id });
  }, [rental, call]);

  return (
    <>
      <ActionButton
        id="rentals-list-delete"
        variant="contained"
        color="secondary"
        disabled={!rental}
        onClick={openModal}
        label="Delete Rental"
      />
      {isOpen && rental && (
        <FormModal
          id="delete-rental"
          loading={isRequesting}
          isOpen={isOpen}
          closeHandler={closeModal}
          title="Delete Rental"
          onSubmit={onSubmit}
          submitText="Delete"
          error={error}
        >
          <Typography gutterBottom>
            Are you sure you want to delete this rental?
          </Typography>
          <KeyValueItem label="Contact">
            <span id="delete-rental-member">{rental.memberName}</span>
          </KeyValueItem>
          <KeyValueItem label="Number">
            <span id="delete-rental-number">{rental.number}</span>
          </KeyValueItem>
          <KeyValueItem label="Description">
            <span id="delete-rental-description">{rental.description}</span>
          </KeyValueItem>
        </FormModal>
      )}
    </>
  );
}

export default DeleteRentalModal;
