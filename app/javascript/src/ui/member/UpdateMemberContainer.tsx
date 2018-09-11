import * as React from "react";
import { connect } from "react-redux";

import { MemberDetails } from "app/entities/member";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import Form from "ui/common/Form";
import RenewalForm from "ui/common/RenewalForm"
import { updateMemberAction } from "ui/member/actions";
import MemberForm from "ui/member/MemberForm"

export interface UpdateMemberRenderProps extends Props {
  submit: (form: Form) => void;
  setRef: (ref: MemberForm | RenewalForm) => void;
}
interface OwnProps {
  member: MemberDetails;
  isOpen: boolean;
  closeHandler: () => void;
  render: (renderPayload: UpdateMemberRenderProps) => JSX.Element;
}
interface StateProps {
  error: string;
  isUpdating: boolean;
}
interface DispatchProps {
  updateMember: (updatedMember: MemberDetails) => void;
}
interface Props extends OwnProps, StateProps, DispatchProps {}

class EditMember extends React.Component<Props, {}> {
  private formRef: MemberForm;
  private setFormRef = (ref: MemberForm) => this.formRef = ref;

  public componentDidUpdate(prevProps: Props){
    const { isUpdating: wasUpdating } = prevProps;
    const { isOpen, isUpdating, closeHandler } = this.props;
    if (isOpen && wasUpdating && !isUpdating) {
      closeHandler();
    }
  }

  private submitEditForm = async (form: Form) => {
    const validUpdate: MemberDetails = await this.formRef.validate(form);

    if (!form.isValid()) return;

    await this.props.updateMember(validUpdate);
  }

  public render(): JSX.Element {
    const { render } = this.props;
    const renderPayload = {
      ...this.props,
      submit: this.submitEditForm,
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
  const { isRequesting: isUpdating, error } = state.member.update
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
    updateMember: (memberDetails) => dispatch(updateMemberAction(ownProps.member.id, memberDetails)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditMember);