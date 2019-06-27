import * as React from "react";
import { connect } from "react-redux";

import { Invoice } from "app/entities/invoice";
import { CrudOperation } from "app/constants";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import Form from "ui/common/Form";
import { Subscription } from "app/entities/subscription";
import DeleteSubscription from "ui/subscriptions/DeleteSubscriptionModal";
import { deleteSubscriptionAction } from "ui/subscriptions/actions";


export interface UpdateSubscriptionRenderProps extends Props {
  submit: (form: Form) => Promise<boolean>;
  setRef: (ref: DeleteSubscription) => void;
}
interface OwnProps {
  subscription?: Partial<Subscription>;
  isOpen: boolean;
  isAdmin: boolean;
  operation: CrudOperation;
  closeHandler: () => void;
  render: (renderPayload: UpdateSubscriptionRenderProps) => JSX.Element;
}
interface StateProps {
  error: string;
  isRequesting: boolean;
}
interface DispatchProps {
  dispatchSubscription: (subscriptionId: string) => void;
}
interface Props extends OwnProps, StateProps, DispatchProps { }

class UpdateSubscription extends React.Component<Props, {}> {
  private formRef: DeleteSubscription;
  private setFormRef = (ref: DeleteSubscription) => this.formRef = ref;

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;
    const { isOpen, isRequesting, closeHandler, error } = this.props;
    if (isOpen && wasRequesting && !isRequesting && !error) {
      closeHandler();
    }
  }

  private submit = async (form: Form) => {
    const { subscription } = this.props;

    await this.props.dispatchSubscription(subscription.id);
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
  const { isAdmin, operation } = ownProps;
  return {
    dispatchSubscription: async (id: string) => {
      let action;
      switch (operation) {
        case CrudOperation.Delete:
          action = (deleteSubscriptionAction(id, isAdmin));
          break;
      }
      await dispatch(action);
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateSubscription);
