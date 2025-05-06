import * as React from "react";
import Typography from "@material-ui/core/Typography";
import { Invoice } from "makerspace-ts-api-client";
import useModal from "../hooks/useModal";
import { ActionButton } from "../common/ButtonRow";
import FormModal from "ui/common/FormModal";
import InvoiceDetails from "./InvoiceDetails";
import SettleInvoiceModal from "./SettleInvoiceModal";
import { useAuthState } from "../reducer/hooks";

interface Props {
  invoice: Invoice;
  onUpdate: () => void;
}

const ViewInvoiceModal: React.FC<Props> = ({ invoice, onUpdate }) => {
  const { currentUser: { isAdmin } } = useAuthState();
  const {isOpen, openModal, closeModal} = useModal();

  return (
    <>
      <ActionButton 
        id="view-invoice-button"
        color="secondary"
        variant="outlined"
        label="View"
        onClick={openModal}
      />
    {isOpen && (
      <FormModal
          id="select-membership"
          isOpen={isOpen}
          closeHandler={closeModal}
          cancelText="Close"
        >
          <Typography variant="h4" gutterBottom>
            Details
          </Typography>
          <InvoiceDetails invoice={invoice}/>
          {isAdmin && <SettleInvoiceModal invoice={invoice} onSuccess={onUpdate}/>}
        </FormModal>
      )}
    </>
  )
};

export default ViewInvoiceModal;
