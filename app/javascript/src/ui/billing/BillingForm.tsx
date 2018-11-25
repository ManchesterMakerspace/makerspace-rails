import * as React from "react";
import FormModal from "ui/common/FormModal";
import Form from "ui/common/Form";

import { InvoiceOption } from "app/entities/invoice";
import { fields } from "ui/billing/constants";

interface OwnProps {
  option?: Partial<InvoiceOption>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}

class BillingForm extends React.Component<OwnProps,{}>{
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public validate = async (form: Form): Promise<InvoiceOption> => {
    return await form.simpleValidate<InvoiceOption>(fields);
  }

  public render() {
    const { isOpen, onClose, isRequesting, error, onSubmit, option } = this.props;
    return (
      <FormModal
        formRef={this.setFormRef}
        id="invoice-form"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title={(option && option.id) ? "Edit Billing Option" : "Create Billing Option"}
        onSubmit={onSubmit}
        submitText="Save"
        error={error}
      >
        Foo
      </FormModal>
    )
  }
}

export default BillingForm;