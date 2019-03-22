import * as React from "react";
import { connect } from "react-redux";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { MemberDetails } from "app/entities/member";
import { CrudOperation } from "app/constants";

import Form from "ui/common/Form";
import { EarnedMembership, NewReport } from "app/entities/earnedMembership";
import {
  createMembershipAction,
  updateMembershipAction,
  deleteMembershipAction
} from "ui/earnedMemberships/actions";
import { createReportAction } from "ui/reports/actions";
import { ReportForm } from "ui/reports/ReportForm";
import { readMembershipAction } from "ui/earnedMemberships/actions";
import { readMemberAction } from "ui/member/actions";

export interface UpdateReportRenderProps extends Props {
  submit: (form: Form) => Promise<void>;
  setRef: (ref: ReportForm) => void;
}
interface OwnProps {
  membership: EarnedMembership;
  member: Partial<MemberDetails>;
  isOpen: boolean;
  operation: CrudOperation;
  closeHandler: () => void;
  render: (renderPayload: UpdateReportRenderProps) => JSX.Element;
}

interface StateProps {
  isRequesting: boolean;
  error: string;
}

interface DispatchProps {
  dispatchReport: (updateReport: NewReport) => void;
  getMember: () => Promise<void>;
  getEarnedMembership: () => void;
}

interface Props extends OwnProps, StateProps, DispatchProps { }

class EditReport extends React.Component<Props> {
  private formRef: ReportForm;
  private setFormRef = (ref: ReportForm) => this.formRef = ref;

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;
    const { isOpen, isRequesting, error, closeHandler } = this.props;
    if (isOpen && wasRequesting && !isRequesting && !error) {
      closeHandler();
      this.props.getMember();
      this.props.getEarnedMembership();
    }
  }

  private submitForm = async (form: Form) => {
    const validUpdate: NewReport = await this.formRef.validate(form);

    if (!form.isValid()) return;

    return await this.props.dispatchReport(validUpdate);
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
    case CrudOperation.Create:
      stateProps = state.reports.create;
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
    getMember: () => dispatch(readMemberAction(membership.memberId)),
    getEarnedMembership: () => dispatch(readMembershipAction(membership.id)),
    dispatchReport: (reportDetails) => {
      let action;
      switch (operation) {
        case CrudOperation.Create:
          action = (createReportAction(reportDetails));
          break;
      }
      return dispatch(action);
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditReport);
