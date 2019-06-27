import * as React from "react";
import { connect } from "react-redux";

import { Invoice,
  InvoiceableResource,
  isInvoiceOptionSelection,
  InvoiceOptionSelection,
  InvoiceOption
} from "app/entities/invoice";
import { CrudOperation } from "app/constants";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import Form from "ui/common/Form";
import { InvoiceForm } from "ui/invoice/InvoiceForm"
import SettleInvoiceModal from "ui/invoice/SettleInvoiceModal"
import { updateInvoiceAction, deleteInvoiceAction } from "ui/invoice/actions";
import { createInvoiceAction } from "ui/invoices/actions";
import DeleteInvoiceModal from "ui/invoice/DeleteInvoiceModal";
import { readOptionsAction } from "ui/billing/actions";
import { Whitelists } from "app/constants";
import { CollectionOf } from "app/interfaces";


export interface UpdateInvoiceRenderProps extends Props {
  submit: (form: Form) => Promise<boolean>;
  setRef: (ref: InvoiceForm | SettleInvoiceModal | DeleteInvoiceModal) => void;
}
interface OwnProps {
  invoice?: Partial<Invoice>;
  customBillingEnabled: boolean;
  isOpen: boolean;
  operation: CrudOperation;
  closeHandler: () => void;
  render: (renderPayload: UpdateInvoiceRenderProps) => JSX.Element;
}
interface StateProps {
  error: string;
  isRequesting: boolean;
  allowCustomBilling: boolean;
  invoiceOptions: CollectionOf<InvoiceOption>;
  optionsLoading: boolean;
  optionsError: string;
}
interface DispatchProps {
  dispatchInvoice: (updatedInvoice: Invoice) => void;
  getInvoiceOptions: (type: InvoiceableResource) => void;
  dispatchInvoiceOptionSelect: (invoiceOption: InvoiceOptionSelection) => void;
}
interface Props extends OwnProps, StateProps, DispatchProps { }

class UpdateInvoice extends React.Component<Props, {}> {
  private formRef: InvoiceForm;
  private setFormRef = (ref: InvoiceForm) => this.formRef = ref;

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;
    const { isOpen, isRequesting, closeHandler, error } = this.props;
    if (isOpen && wasRequesting && !isRequesting && !error) {
      closeHandler();
    }
  }

  private submit = async (form: Form): Promise<boolean> => {
    const { invoice } = this.props;
    let validUpdate: Invoice;
    if (this.formRef.validate) {
      validUpdate = this.formRef.validate && await this.formRef.validate(form);
    }
    if (!form.isValid()) return;

    if (validUpdate && isInvoiceOptionSelection(validUpdate)) {
      await this.props.dispatchInvoiceOptionSelect(validUpdate);
    } else {
      const updatedInvoice = {
        ...invoice,
        ...validUpdate
      }
      await this.props.dispatchInvoice(updatedInvoice);
    }
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
  ownProps: OwnProps
): StateProps => {
  let stateProps: Partial<StateProps> = {};
  const { operation } = ownProps;
  switch (operation) {
    case CrudOperation.Update:
      stateProps = state.invoice.update;
      break;
    case CrudOperation.Create:
      stateProps = state.invoices.create;
      break;
    case CrudOperation.Delete:
      stateProps = state.invoice.delete;
      break;
  }
  const { permissions } = state.auth;
  const {
    entities: invoiceOptions,
    read: {
      isRequesting: optionsLoading,
      error: optionsError
    }
  } = state.billing;

  const { isRequesting, error } = stateProps;
  return {
    error,
    isRequesting,
    invoiceOptions,
    optionsLoading,
    optionsError,
    allowCustomBilling: !!permissions[Whitelists.customBilling] || false,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps,
): DispatchProps => {
  const { invoice, operation } = ownProps;
  return {
    dispatchInvoice: (invoiceDetails) => {
      let action;
      switch (operation) {
        case CrudOperation.Update:
          action = (updateInvoiceAction(invoice.id, invoiceDetails));
          break;
        case CrudOperation.Create:
          action = (createInvoiceAction(invoiceDetails, true));
          break;
        case CrudOperation.Delete:
          action = (deleteInvoiceAction(invoice.id));
          break;
      }
      action && dispatch(action);
    },
    dispatchInvoiceOptionSelect: (invoiceOption) => dispatch(createInvoiceAction(invoiceOption, true)),
    getInvoiceOptions: (type) => dispatch(readOptionsAction({ types: [type] }))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateInvoice);
