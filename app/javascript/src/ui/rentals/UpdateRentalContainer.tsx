import * as React from "react";
import { connect } from "react-redux";

import { Rental } from "app/entities/rental";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import Form from "ui/common/Form";
import RenewalForm from "ui/common/RenewalForm"
import { updateRentalAction, createRentalAction, deleteRentalAction } from "ui/rentals/actions";
import { CrudOperation } from "app/constants";
import RentalForm from "ui/rentals/RentalForm";
import DeleteRentalModal from "ui/rentals/DeleteRentalModal";

export interface UpdateRentalRenderProps extends Props {
  submit: (form: Form) => void;
  setRef: (ref: RentalForm | RenewalForm | DeleteRentalModal) => void;
}
interface OwnProps {
  rental: Partial<Rental>;
  operation: CrudOperation;
  isOpen: boolean;
  closeHandler: () => void;
  render: (renderPayload: UpdateRentalRenderProps) => JSX.Element;
}
interface StateProps {
  error: string;
  isRequesting: boolean;
}
interface DispatchProps {
  dispatchRental: (updateRental: Rental) => void;
}
interface Props extends OwnProps, StateProps, DispatchProps { }

class UpdateRental extends React.Component<Props, {}> {
  private formRef: RentalForm;
  private setFormRef = (ref: RentalForm) => this.formRef = ref;

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;
    const { isOpen, isRequesting, closeHandler, error } = this.props;
    if (isOpen && wasRequesting && !isRequesting && !error) {
      closeHandler();
    }
  }

  private submitRentalForm = async (form: Form) => {
    const validUpdate: Rental = this.formRef.validate && await this.formRef.validate(form);

    if (!form.isValid()) return;
    await this.props.dispatchRental(validUpdate);
    if (!this.props.error) {
      return true;
    }
  }

  public render(): JSX.Element {
    const { render } = this.props;
    const renderPayload = {
      ...this.props,
      submit: this.submitRentalForm,
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
      stateProps = state.rentals.update;
      break;
    case CrudOperation.Create:
      stateProps = state.rentals.create;
      break;
    case CrudOperation.Delete:
      stateProps = state.rentals.delete;
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
  const { rental, operation } = ownProps;
  return {
    dispatchRental: (rentalDetails) => {
      let action;
      switch (operation) {
        case CrudOperation.Update:
          action = (updateRentalAction(rental.id, rentalDetails));
          break;
        case CrudOperation.Create:
          action = (createRentalAction(rentalDetails));
          break;
        case CrudOperation.Delete:
          action = (deleteRentalAction(rental.id));
          break;
      }
      return dispatch(action);
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateRental);
