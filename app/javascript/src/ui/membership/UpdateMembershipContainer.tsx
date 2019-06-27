import * as React from "react";
import { connect } from "react-redux";

import { Invoice } from "app/entities/invoice";
import { CrudOperation } from "app/constants";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import Form from "ui/common/Form";
import { Subscription } from "app/entities/subscription";
import { Action as CheckoutAction } from "ui/checkout/constants";
import DeleteSubscription from "ui/subscriptions/DeleteSubscriptionModal";
import { deleteSubscriptionAction, updateSubscriptionAction } from "ui/subscriptions/actions";
import CancelMembershipModal from "ui/membership/CancelMembershipModal";
import { createInvoiceAction } from "ui/invoices/actions";


export interface UpdateSubscriptionRenderProps extends Props {
  submit: (form: Form) => void;
  setRef: (ref: CancelMembershipModal | Form) => void;
}
interface OwnProps {
  subscription: Partial<Subscription>;
  invoice: Partial<Invoice>;
  discountId?: string;
  membershipOptionId?: string;
  paymentMethodToken?: string;
  isOpen: boolean;
  operation: CrudOperation;
  closeHandler: () => void;
  render: (renderPayload: UpdateSubscriptionRenderProps) => JSX.Element;
}
interface StateProps {
  error: string;
  isRequesting: boolean;
}
interface DispatchProps {
  dispatchSubscription: () => void;
}
interface Props extends OwnProps, StateProps, DispatchProps { }

class UpdateSubscription extends React.Component<Props, {}> {
  private formRef: CancelMembershipModal | Form;
  private setFormRef = (ref: CancelMembershipModal | Form) => this.formRef = ref;

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;
    const { isOpen, isRequesting, closeHandler, error } = this.props;
    if (isOpen && wasRequesting && !isRequesting && !error) {
      closeHandler();
    }
  }

  private submit = async (form: Form) => {
    await this.props.dispatchSubscription();
    if (!this.props.error) {
      return true;
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
    case CrudOperation.Delete:
      stateProps = state.subscriptions.delete;
      break;
    case CrudOperation.Update:
      stateProps = state.subscriptions.update;
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
  const { operation, subscription, discountId, membershipOptionId, paymentMethodToken } = ownProps;
  return {
    dispatchSubscription: async () => {
      switch (operation) {
        case CrudOperation.Delete:
          await dispatch(deleteSubscriptionAction(subscription.id));
          break;
        case CrudOperation.Update:
          if (subscription) {
            await dispatch(updateSubscriptionAction(subscription.id, {
              discountId,
              paymentMethodToken,
              invoiceOptionId: membershipOptionId,
            }))
          } else {
            const newInvoice = await dispatch(createInvoiceAction({ discountId, invoiceOptionId: membershipOptionId }, false));
            dispatch({ type: CheckoutAction.StageInvoicesForPayment, data: [newInvoice] })
          }
          break;
      }
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateSubscription);
