import * as React from "react";
import { connect } from "react-redux";

import { InvoiceOption } from "makerspace-ts-api-client";
import { CrudOperation } from "app/constants";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import Form from "ui/common/Form";
import { updateBillingAction, createBillingAction, deleteBillingAction } from "ui/billing/actions";
import { BillingFormComponent } from "ui/billing/BillingForm"
import DeleteInvoiceOptionModal from "ui/billing/DeleteInvoiceOptionModal";

export interface UpdateBillingRenderProps extends Props {
  submit: (form: Form) => Promise<boolean>;
  setRef: (ref: BillingFormComponent | DeleteInvoiceOptionModal) => void;
}
interface OwnProps {
  billingOption: Partial<InvoiceOption>;
  isOpen: boolean;
  operation: CrudOperation;
  closeHandler: () => void;
  render: (renderPayload: UpdateBillingRenderProps) => JSX.Element;
}
interface StateProps {
  isRequesting: boolean;
  error: string;
}
interface DispatchProps {
  dispatchBilling: (updatedBillingOption: InvoiceOption) => Promise<void>;
}
interface Props extends OwnProps, StateProps, DispatchProps { }

class EditBillingOption extends React.Component<Props, {}> {
  private formRef: BillingFormComponent;
  private setFormRef = (ref: BillingFormComponent) => this.formRef = ref;

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;
    const { isOpen, isRequesting, closeHandler, error } = this.props;
    if (isOpen && wasRequesting && !isRequesting && !error) {
      closeHandler();
    }
  }

  private submitMemberForm = async (form: Form) => {
    const validUpdate: InvoiceOption = await this.formRef.validate && await this.formRef.validate(form);

    if (!form.isValid()) return;

    await this.props.dispatchBilling(validUpdate);
    if (!this.props.error) {
      return true;
    }
  }

  public render(): JSX.Element {
    const { render } = this.props;
    const renderPayload = {
      ...this.props,
      submit: this.submitMemberForm,
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
      stateProps = state.billing.update;
      break;
    case CrudOperation.Create:
      stateProps = state.billing.create;
      break;
    case CrudOperation.Delete:
      stateProps = state.billing.delete;
      break;
  }

  const { isRequesting, error } = stateProps;
  return {
    error,
    isRequesting
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps,
): DispatchProps => {
  const { billingOption, operation } = ownProps;
  return {
    dispatchBilling: (billingOptionDetails) => {
      let action;
      switch (operation) {
        case CrudOperation.Delete:
          action = (deleteBillingAction(billingOption.id));
          break;
        case CrudOperation.Update:
          action = (updateBillingAction(billingOption.id, billingOptionDetails));
          break;
        case CrudOperation.Create:
          action = (createBillingAction(billingOptionDetails));
          break;
      }
      return dispatch(action);
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditBillingOption);
