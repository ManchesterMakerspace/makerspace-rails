import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Grid, Typography, Button } from "@material-ui/core";

import { MemberDetails } from "app/entities/member";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { timeToDate } from "ui/utils/timeToDate";
import LoadingOverlay from "ui/common/LoadingOverlay";
import Form from "ui/common/Form";
import RenewalForm, { RenewForm } from "ui/common/RenewalForm";
import KeyValueItem from "ui/common/KeyValueItem";
import { readMemberAction, updateMemberAction } from "ui/member/actions";
import MemberForm from "ui/member/MemberForm"
import { memberToRenewal } from "ui/member/utils";
import { membershipRenewalOptions } from "ui/members/constants";
import MemberStatusLabel from "ui/member/MemberStatusLabel";

interface DispatchProps {
  getMember: () => Promise<void>;
  updateMember: (details: Partial<MemberDetails>) => void;
}
interface StateProps {
  requestingError: string;
  isRequestingMember: boolean;
  updateError: string;
  isUpdatingMember: boolean;
  member: MemberDetails
}
interface OwnProps extends RouteComponentProps<any> {}
interface Props extends OwnProps, DispatchProps, StateProps {}

interface State {
  isEditOpen: boolean;
  isRenewOpen: boolean;
}
const defaultState = {
  isEditOpen: false,
  isRenewOpen: false,
}

class MemberDetail extends React.Component<Props, State> {
  private renewFormRef: RenewalForm;
  private setRenewFormRef = (ref: RenewalForm) => this.renewFormRef = ref;
  private editFormRef: MemberForm;
  private setEditFormRef = (ref: MemberForm) => this.editFormRef = ref;


  constructor(props: Props) {
    super(props);

    this.state = defaultState;
  }

  public componentDidMount() {
    this.props.getMember();
  }

  public componentDidUpdate(prevProps: Props) {
    const oldMemberId = prevProps.match.params.memberId;
    const { isRequestingMember, match, getMember } = this.props;
    const { memberId } = match.params;
    if (oldMemberId !== memberId && !isRequestingMember) {
      getMember();
    }
  }

  private openRenewModal = () => this.setState({ isRenewOpen: true });
  private closeRenewModal = () => this.setState({ isRenewOpen: false });
  private submitRenewalForm = async (form: Form) => {
    const validRenewal: RenewForm = await this.renewFormRef.validateRenewalForm(form);

    if (!form.isValid()) return;

    await this.props.updateMember(validRenewal);
  }

  private openEditModal = () => this.setState({ isEditOpen: true });
  private closeEditModal = () => this.setState({ isEditOpen: false });
  private submitEditForm = async (form: Form) => {
    const validUpdate: MemberDetails = await this.editFormRef.validate(form);

    if (!form.isValid()) return;

    await this.props.updateMember(validUpdate);
  }

  private renderMemberInfo = (): JSX.Element => {
    const { member, isRequestingMember } = this.props;

    return (
      <Grid container spacing={24} justify="center">
        <Grid item xs={10}>
          <Typography gutterBottom variant="title">{`${member.firstname} ${member.lastname}`}</Typography>
          <Button
            style={{marginRight: ".25em"}}
            color="primary"
            variant="contained"
            disabled={isRequestingMember}
            onClick={this.openRenewModal}
          >
            Renew
          </Button>
          <Button
            style={{marginLeft: ".25em"}}
            color="primary"
            variant="outlined"
            disabled={isRequestingMember}
            onClick={this.openEditModal}
          >
            Edit
          </Button>
        </Grid>
        <Grid item xs={10} style={{ border: "1px solid black", borderRadius: "3px" }}>
          <KeyValueItem label="Email" value={member.email ? <a href={`mailto:${member.email}`}>{member.email}</a> : "N/A"}/>
          <KeyValueItem label="Membership Expiration" value={timeToDate(member.expirationTime)}/>
          <KeyValueItem label="Membership Status" value={<MemberStatusLabel member={member} />} />
        </Grid>
      </Grid>
    )
  }

  private renderMemberDetails = (): JSX.Element => {
    const { member, updateError, isUpdatingMember } = this.props;
    const { isRenewOpen, isEditOpen } = this.state;

    return (
      <>
        {this.renderMemberInfo()}
        <RenewalForm
          ref={this.setRenewFormRef}
          renewalOptions={membershipRenewalOptions}
          title="Renew Membership"
          entity={memberToRenewal(member)}
          isOpen={isRenewOpen}
          isRequesting={isUpdatingMember}
          error={updateError}
          onClose={this.closeRenewModal}
          onSubmit={this.submitRenewalForm}
        />
        <MemberForm
          ref={this.setEditFormRef}
          member={member}
          isOpen={isEditOpen}
          isRequesting={isUpdatingMember}
          error={updateError}
          onClose={this.closeEditModal}
          onSubmit={this.submitEditForm}
        />
      </>
    )
  }

  public render(): JSX.Element {
    const { member, isRequestingMember, match } = this.props;
    const { memberId } = match.params
    return (
      <>
        { isRequestingMember && <LoadingOverlay id={memberId} />}
        {member && this.renderMemberDetails()}
      </>
    )
  }
}

const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const { isRequesting, error: requestingError } = state.member.read;
  const { isRequesting: isUpdating, error: updateError } = state.member.update
  const { entity: member } = state.member;
  return {
    member,
    updateError,
    requestingError,
    isRequestingMember: isRequesting,
    isUpdatingMember: isUpdating
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps,
): DispatchProps => {
  const memberId = ownProps.match.params.memberId;
  return {
    getMember: () => dispatch(readMemberAction(memberId)),
    updateMember: (memberDetails) => dispatch(updateMemberAction(memberId, memberDetails)),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MemberDetail));