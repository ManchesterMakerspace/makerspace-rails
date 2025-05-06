import * as React from "react";
import Typography from "@material-ui/core/Typography";
import { adminDeleteInvoice } from "makerspace-ts-api-client";

import FormModal from "ui/common/FormModal";
import KeyValueItem from "ui/common/KeyValueItem";
import { timeToDate } from "ui/utils/timeToDate";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { MemberInvoice, RentalInvoice } from "app/entities/invoice";
import useModal from "../hooks/useModal";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { ActionButton } from "ui/common/ButtonRow";


interface Props {
  invoice: MemberInvoice | RentalInvoice;
  onSuccess?: () => void;
}

const DeleteInvoiceModal: React.FC<Props> = ({ invoice, onSuccess }) => {
  const { isOpen, openModal, closeModal } = useModal();

  const onDelete = React.useCallback(({ reset }) => {
    closeModal();
    onSuccess();
    reset();
  }, [closeModal, onSuccess]);

  const { call, isRequesting, error } = useWriteTransaction(adminDeleteInvoice, onDelete);
  const onSubmit = React.useCallback(() => {
    call({ id: invoice.id });
  }, [invoice, call]);

  return (
    <>
      <ActionButton
        id="invoices-list-delete"
        variant="contained"
        color="secondary"
        disabled={!invoice}
        onClick={openModal}
        label="Delete Invoice"
      />
      {isOpen && (
        <FormModal
          id="delete-invoice"
          loading={isRequesting}
          isOpen={isOpen}
          closeHandler={closeModal}
          title="Delete Invoice"
          onSubmit={onSubmit}
          submitText="Delete"
          error={error}
        >
          <Typography gutterBottom>
            Are you sure you want to delete this invoice?
          </Typography>
          <KeyValueItem label="Member">
            <span id="delete-invoice-member">{invoice.memberName}</span>
          </KeyValueItem>
          <KeyValueItem label="Description">
            <span id="delete-invoice-description">{invoice.description}</span>
          </KeyValueItem>
          <KeyValueItem label="Amount">
            <span id="delete-invoice-amount">{numberAsCurrency(invoice.amount)}</span>
          </KeyValueItem>
          <KeyValueItem label="Due Date">
            <span id="delete-invoice-due-date">{timeToDate(invoice.dueDate)}</span>
          </KeyValueItem>
        </FormModal>
      )}
    </>
  );
}

export default DeleteInvoiceModal;
