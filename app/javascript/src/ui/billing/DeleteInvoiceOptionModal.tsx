import * as React from "react";
import Typography from "@material-ui/core/Typography";

import { InvoiceOption } from "app/entities/invoice";
import FormModal from "ui/common/FormModal";
import KeyValueItem from "ui/common/KeyValueItem";
import Form from "ui/common/Form";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";

interface OwnProps {
  option: Partial<InvoiceOption>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}


class DeleteInvoiceOptionModal extends React.Component<OwnProps, {}> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit, option } = this.props;

    return option ? (
      <FormModal
        formRef={this.setFormRef}
        id="delete-invoice-option-confirm"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title="Delete Billing Option"
        onSubmit={onSubmit}
        submitText="Delete"
        error={error}
      >
        <Typography gutterBottom>
          Are you sure you want to delete this billing option?
        </Typography>
        <KeyValueItem label="Name">
          <span id="delete-invoice-option-name">{option.name}</span>
        </KeyValueItem>
        <KeyValueItem label="Description">
          <span id="delete-invoice-option-description">{option.description}</span>
        </KeyValueItem>
        <KeyValueItem label="Amount">
          <span id="delete-invoice-option-amount">{numberAsCurrency(option.amount)}</span>
        </KeyValueItem>
      </FormModal>
    ) : null;
  }
}

export default DeleteInvoiceOptionModal;
