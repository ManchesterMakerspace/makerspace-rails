import * as React from "react";
import { connect } from "react-redux";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { MemberDetails } from "app/entities/member";
import { CrudOperation } from "app/constants";

import Form from "ui/common/Form";
import EarnedMembershipForm from "ui/earnedMemberships/EarnedMembershipForm"
import { EarnedMembership } from "app/entities/earnedMembership";
import {
  createMembershipAction,
  updateMembershipAction,
  deleteMembershipAction
} from "ui/earnedMemberships/actions";

export interface UpdateMembershipRenderProps extends Props {
  submit: (form: Form) => Promise<void>;
  setRef: (ref: EarnedMembershipForm) => void;
}
interface OwnProps {
  membership: Partial<EarnedMembership>;
  member?: Partial<MemberDetails>;
  isOpen: boolean;
  operation: CrudOperation;
  closeHandler: () => void;
  render: (renderPayload: UpdateMembershipRenderProps) => JSX.Element;
}

interface StateProps {
  isRequesting: boolean;
  error: string;
}

interface DispatchProps {
  dispatchMembership: (updateMembership: EarnedMembership) => void;
}

interface Props extends OwnProps, StateProps, DispatchProps { }

class EditEarnedMembership extends React.Component<Props> {
  private formRef: EarnedMembershipForm;
  private setFormRef = (ref: EarnedMembershipForm) => this.formRef = ref;

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;
    const { isOpen, isRequesting, error, closeHandler } = this.props;
    if (isOpen && wasRequesting && !isRequesting && !error) {
      closeHandler();
    }
  }

  private submitForm = async (form: Form) => {
    const validUpdate: EarnedMembership = await this.formRef.validate(form);

    if (true || !form.isValid()) return;

    return await this.props.dispatchMembership(validUpdate);
  }

  public render(): JSX.Element {
    const { render } = this.props;
    const renderPayload = {
      ...this.props,
      submit: this.submitForm,
      setRef: this.setFormRef,
    }
    return render(renderPayload);
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
  const { membership, operation } = ownProps;
  return {
    dispatchMembership: (membershipDetails) => {
      let action;
      switch (operation) {
        case CrudOperation.Update:
          action = (updateMembershipAction(membership.id, membershipDetails));
          break;
        case CrudOperation.Create:
          action = (createMembershipAction(membershipDetails));
          break;
        case CrudOperation.Delete:
          action = (deleteMembershipAction(membership.id));
          break;
      }
      return dispatch(action);
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditEarnedMembership);
