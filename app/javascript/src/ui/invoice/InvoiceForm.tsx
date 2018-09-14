import * as React from "react";
import { TextField, Typography, Grid, Select, InputLabel } from "@material-ui/core";

import { Invoice, InvoiceableResource } from "app/entities/invoice";
import FormModal from "ui/common/FormModal";
import FieldList from "ui/common/FieldList";
import Form from "ui/common/Form";
import { fields } from "ui/invoice/constants";
import { isEmpty, kebabCase } from "lodash-es";
import { membershipRenewalOptions } from "ui/members/constants";

interface OwnProps {
  invoice?: Partial<Invoice>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}


class InvoiceForm extends React.Component<OwnProps, {}> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public validate = async (_form: Form): Promise<Invoice> => (
    this.formRef.simpleValidate<Invoice>(fields)
  );

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit, invoice } = this.props;

    return (
      <FormModal
        formRef={this.setFormRef}
        id="invoice-form"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title={isEmpty(invoice) && "Create Invoice" || "Edit Invoice"}
        onSubmit={onSubmit}
        submitText="Save"
        error={error}
      >
        <TextField
          fullWidth
          required
          value={invoice && invoice.description}
          label={fields.description.label}
          name={fields.description.name}
          placeholder={fields.description.placeholder}
        />
        <TextField
          fullWidth
          required
          value={invoice && invoice.contact}
          label={fields.contact.label}
          name={fields.contact.name}
          placeholder={fields.contact.placeholder}
        />
        <TextField
          fullWidth
          required
          value={invoice && invoice.amount}
          label={fields.amount.label}
          name={fields.amount.name}
          placeholder={fields.amount.placeholder}
        />
        <TextField
          fullWidth
          required
          value={invoice && invoice.due_date}
          label={fields.due_date.label}
          name={fields.due_date.name}
          placeholder={fields.due_date.placeholder}
          type="date"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          fullWidth
          value={invoice && invoice.notes}
          label={fields.notes.label}
          name={fields.notes.name}
          placeholder={fields.notes.placeholder}
          multiline={true}
        />
      </FormModal>
    )
  }
}

export default InvoiceForm;
