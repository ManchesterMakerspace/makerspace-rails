import * as React from "react";
import { adminCreateInvoices } from "makerspace-ts-api-client";

import Form from "ui/common/Form";
import useModal from "../hooks/useModal";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { ActionButton } from "ui/common/ButtonRow";
import { useAuthState } from "../reducer/hooks";
import { Whitelists } from "app/constants";
import InvoiceForm from "./InvoiceForm";


const CreateInvoiceModal: React.FC<{ memberId: string, onSuccess: () => void }> = ({ memberId, onSuccess }) => {
  const { isOpen, openModal, closeModal } = useModal();
  const formRef = React.useRef(null);
  const { permissions } = useAuthState();
  const allowCustomBilling = !!permissions[Whitelists.customBilling];

  const onCreate = React.useCallback(({ reset }) => {
    closeModal();
    onSuccess();
    reset();
  }, [closeModal, onSuccess]);
  const { call, isRequesting, error } = useWriteTransaction(adminCreateInvoices, onCreate);
  const onSubmit = React.useCallback(async (form: Form) => {
    const validUpdate = formRef.current.validate && await formRef.current.validate(form);
    if (!form.isValid()) return;

    validUpdate && call({ body: validUpdate });
  }, [formRef, call]);

  return (
    <>
      <ActionButton
        id="invoices-list-create"
        variant="contained"
        color="primary"
        onClick={openModal}
        label="Create New Invoice"
      />
      {isOpen && (
        <InvoiceForm
          ref={formRef}
          invoice={memberId && {
            memberId
          }}
          isOpen={true}
          isRequesting={isRequesting}
          error={error}
          onClose={closeModal}
          onSubmit={onSubmit}
          allowCustomBilling={allowCustomBilling}
          memberId={memberId}
        />
      )}
    </>
  );
};

export default CreateInvoiceModal