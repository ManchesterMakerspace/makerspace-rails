import * as React from "react";
import { connect } from "react-redux";

import { Invoice } from "app/entities/invoice";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import Form from "ui/common/Form";
import InvoiceForm from "ui/invoice/InvoiceForm"
import SettleInvoiceModal from "ui/invoice/SettleInvoiceModal"
import { updateInvoiceAction } from "ui/invoice/actions";


export interface UpdateInvoiceRenderProps extends Props {
  submit: (form: Form) => void;
  setRef: (ref: InvoiceForm | SettleInvoiceModal) => void;
}
interface OwnProps {
  invoice?: Invoice;
  isOpen: boolean;
  closeHandler: () => void;
  render: (renderPayload: UpdateInvoiceRenderProps) => JSX.Element;
}
interface StateProps {
  error: string;
  isUpdating: boolean;
}
interface DispatchProps {
  updateInvoice: (updatedInvoice: Invoice) => void;
}
interface Props extends OwnProps, StateProps, DispatchProps { }

class UpdateInvoice extends React.Component<Props, {}> {
  private formRef: InvoiceForm;
  private setFormRef = (ref: InvoiceForm) => this.formRef = ref;

  public componentDidUpdate(prevProps: Props) {
    const { isUpdating: wasUpdating } = prevProps;
    const { isOpen, isUpdating, closeHandler } = this.props;
    if (isOpen && wasUpdating && !isUpdating) {
      closeHandler();
    }
  }

  private submit = async (form: Form) => {
    const validUpdate: Invoice = await this.formRef.validate(form);

    if (!form.isValid()) return;

    await this.props.updateInvoice(validUpdate);
  }

  public render(): JSX.Element {
    const { render } = this.props;
    const renderPayload = {
      ...this.props,
      submit: this.submit,
      setRef: this.setFormRef,
    }
    return (
      render(renderPayload)
    )
  }
}

const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const { isRequesting: isUpdating, error } = state.invoice.update;
  return {
    error,
    isUpdating
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps,
): DispatchProps => {
  return {
    updateInvoice: (invoiceDetails) => dispatch(updateInvoiceAction(ownProps.invoice && ownProps.invoice.id, invoiceDetails)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateInvoice);
