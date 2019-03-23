import * as React from "react";
import { connect } from "react-redux";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { MemberDetails } from "app/entities/member";
import { CrudOperation } from "app/constants";

import Form from "ui/common/Form";
import EarnedMembershipForm from "ui/earnedMemberships/EarnedMembershipForm"
import { EarnedMembership, NewEarnedMembership } from "app/entities/earnedMembership";
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
  dispatchMembership: (updateMembership: NewEarnedMembership) => void;
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
    const validUpdate: NewEarnedMembership = await this.formRef.validate(form);

    if (!form.isValid()) {
      const errors = document.querySelectorAll('[id$="-error')
      errors[0] && (errors[0] as HTMLElement).focus();
      return;
    };

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
      stateProps = state.earnedMemberships.update;
      break;
    case CrudOperation.Create:
      stateProps = state.earnedMemberships.create;
      break;
    case CrudOperation.Delete:
      stateProps = state.earnedMemberships.delete;
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
          const currentRequirementNames = membership.requirements.map(req => req.name);
          const mergedRequirements = membershipDetails.requirements.reduce((requirements, requirement) => {
              // Find if it already exists
              const reqIndex = currentRequirementNames.indexOf(requirement.name);

              // If it exists, update existing with shallow patch
              if (reqIndex > -1) {
                requirements[reqIndex] = {
                  ...membership.requirements[reqIndex],
                  ...requirement,
                }
              // Add it to the end if it doesn't already exist
              } else {
                requirements.push(requirement)
              }
              return requirements;
            }, []);

          action = (updateMembershipAction(membership.id, {
            ...membershipDetails,
            requirements: mergedRequirements,
          }));
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
