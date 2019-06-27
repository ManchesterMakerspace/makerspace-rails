import * as React from "react";
import { connect } from "react-redux";

import { Transaction } from "app/entities/transaction";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import Form from "ui/common/Form";
import { refundTransactionAction } from "ui/transactions/actions";
import { CrudOperation } from "app/constants";
import RefundTransactionModal from "ui/transactions/RefundTransactionModal";

export interface UpdateTransactionRenderProps extends Props {
  submit: (form: Form) => Promise<boolean>;
  setRef: (ref: RefundTransactionModal) => void;
}
interface OwnProps {
  transaction: Partial<Transaction>;
  operation: CrudOperation;
  isOpen: boolean;
  isAdmin: boolean;
  closeHandler: () => void;
  render: (renderPayload: UpdateTransactionRenderProps) => JSX.Element;
}
interface StateProps {
  error: string;
  isRequesting: boolean;
}
interface DispatchProps {
  dispatchTransaction: () => void;
}
interface Props extends OwnProps, StateProps, DispatchProps { }

class UpdateTransaction extends React.Component<Props, {}> {
  private formRef: RefundTransactionModal;
  private setFormRef = (ref: RefundTransactionModal) => this.formRef = ref;

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;
    const { isOpen, isRequesting, closeHandler, error } = this.props;
    if (isOpen && wasRequesting && !isRequesting && !error) {
      closeHandler();
    }
  }

  private submitTransactionForm = async (form: Form) => {
    await this.props.dispatchTransaction();
    if (!this.props.error) {
      return true;
    }
  }

  public render(): JSX.Element {
    const { render } = this.props;
    const renderPayload = {
      ...this.props,
      submit: this.submitTransactionForm,
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
      stateProps = state.transactions.delete;
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
  const { transaction, operation, isAdmin } = ownProps;
  return {
    dispatchTransaction: () => {
      let action;
      switch (operation) {
        case CrudOperation.Delete:
          action = (refundTransactionAction(transaction.id, isAdmin));
          break;
      }
      return dispatch(action);
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateTransaction);
