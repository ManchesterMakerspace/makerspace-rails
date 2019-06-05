import * as React from "react";
import Typography from "@material-ui/core/Typography";

import { Invoice } from "app/entities/invoice";
import FormModal from "ui/common/FormModal";
import KeyValueItem from "ui/common/KeyValueItem";
import Form from "ui/common/Form";
import { timeToDate } from "ui/utils/timeToDate";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";

interface OwnProps {
  invoice: Partial<Invoice>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}


class DeleteInvoiceModal extends React.Component<OwnProps, {}> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit, invoice } = this.props;

    return invoice ? (
      <FormModal
        formRef={this.setFormRef}
        id="delete-invoice"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
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
    ) : null;
  }
}

export default DeleteInvoiceModal;
