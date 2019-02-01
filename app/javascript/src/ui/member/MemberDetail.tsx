import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { MemberDetails } from "app/entities/member";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { displayMemberExpiration, buildProfileRouting } from "ui/member/utils";
import LoadingOverlay from "ui/common/LoadingOverlay";
import KeyValueItem from "ui/common/KeyValueItem";
import DetailView from "ui/common/DetailView";
import { readMemberAction } from "ui/member/actions";
import RenewalForm from "ui/common/RenewalForm";
import MemberForm from "ui/member/MemberForm";
import MemberStatusLabel from "ui/member/MemberStatusLabel";
import UpdateMemberContainer, { UpdateMemberRenderProps } from "ui/member/UpdateMemberContainer";
import { memberToRenewal } from "ui/member/utils";
import { membershipRenewalOptions } from "ui/members/constants";
import AccessCardForm from "ui/accessCards/AccessCardForm";
import InvoicesList from "ui/invoices/InvoicesList";
import RentalsList from "ui/rentals/RentalsList";
import { Routing, CrudOperation } from "app/constants";
import { ActionButton } from "ui/common/ButtonRow";
import NotificationModal, { Notification } from "ui/member/NotificationModal";
import { Whitelists } from "app/constants";
import SignDocuments from "ui/auth/SignDocuments";
const { billingEnabled } = Whitelists;

interface DispatchProps {
  getMember: () => Promise<void>;
}
interface StateProps {
  admin: boolean;
  isNewMember: boolean;
  requestingError: string;
  isRequestingMember: boolean;
  isUpdatingMember: boolean;
  member: MemberDetails,
  currentUserId: string;
  subscriptionId: string;
}
interface OwnProps extends RouteComponentProps<any> {
}
interface Props extends OwnProps, DispatchProps, StateProps {}

interface State {
  isEditOpen: boolean;
  isRenewOpen: boolean;
  isCardOpen: boolean;
  displayDocuments: boolean;
  displayNotification: Notification;
  redirect: string;
}
const defaultState: State = {
  isEditOpen: false,
  isRenewOpen: false,
  isCardOpen: false,
  displayDocuments: false,
  displayNotification: undefined,
  redirect: "",
}

const allowedResources = new Set(["dues", "rentals"]);

class MemberDetail extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { isNewMember, member } = this.props;

    this.state = {
      ...defaultState,
      displayNotification: isNewMember || (member && !member.memberContractOnFile) ? Notification.Welcome : undefined,
    };
  }

  public componentDidMount() {
    this.props.getMember();
  }

  public componentDidUpdate(prevProps: Props) {
    const oldMemberId = prevProps.match.params.memberId;
    const { isRequestingMember: wasRequesting } = prevProps;
    const { currentUserId, isRequestingMember, match, getMember, member, history, match: { params: { resource } } } = this.props;
    const { memberId } = match.params;
    if (oldMemberId !== memberId && !isRequestingMember) {
      getMember();
    }
    if (wasRequesting && !isRequestingMember) {
      if (member) {
        if (resource) {
          !allowedResources.has(resource) && history.push(Routing.Profile.replace(Routing.PathPlaceholder.MemberId, currentUserId))
        }
        if (!member.memberContractOnFile) {
          this.setState({ displayNotification: Notification.Welcome  });
        }
      } else {
        history.push(Routing.Members);
      }
    }
  }

  private openRenewModal = () => this.setState({ isRenewOpen: true });
  private closeRenewModal = () => this.setState({ isRenewOpen: false });
  private openEditModal = () => this.setState({ isEditOpen: true });
  private closeEditModal = () => this.setState({ isEditOpen: false });
  private openCardModal = () => this.setState({ isCardOpen: true });
  private closeCardModal = () => this.setState({ isCardOpen: false });

  private renderMemberInfo = (): JSX.Element => {
    const { member } = this.props;

    return (
      <>
        <KeyValueItem label="Email">
          {member.email ? <a id="member-detail-email" href={`mailto:${member.email}`}>{member.email}</a> : "N/A"}
        </KeyValueItem>
        <KeyValueItem  label="Membership Expiration">
          <span id="member-detail-expiration">{displayMemberExpiration(member)}</span>
        </KeyValueItem>
        <KeyValueItem label="Membership Status">
          <MemberStatusLabel id="member-detail-status" member={member} />
        </KeyValueItem>
        <KeyValueItem label="Membership Type">
          <span id="member-detail-type">{member.subscriptionId ? "Subscription" : (member.expirationTime ? "Month-to-month" : "No membership found")}</span>
        </KeyValueItem>
      </>
    )
  }

  private allowViewProfile = () => {
    const { currentUserId } = this.props;
    return this.props.match.params.memberId === currentUserId;
  }

  private redirectToSettings = () => {
    this.setState({ redirect: Routing.Settings });
  }

  private renderMemberDetails = (): JSX.Element => {
    const { member, isUpdatingMember, isRequestingMember, match, admin } = this.props;
    const { memberId, resource } = match.params;
    const { redirect } = this.state;
    const loading = isUpdatingMember || isRequestingMember;
    if (redirect) {
      return <Redirect to={redirect} />
    }
    return (
      <>
        <DetailView
          title={`${member.firstname} ${member.lastname}`}
          basePath={`/members/${memberId}`}
          actionButtons={[
            ...!!this.allowViewProfile() ? [{
              id: "member-detail-open-settings",
              color: "primary",
              variant: "outlined",
              disabled: loading,
              label: "Account Settings",
              onClick: this.redirectToSettings
            } as ActionButton] : [],
            ...admin ? [{
              id: "member-detail-open-edit-modal",
              color: "primary",
              variant: "outlined",
              disabled: loading,
              label: "Edit",
              onClick: this.openEditModal
            },{
              id: "member-detail-open-renew-modal",
              color: "primary",
              variant: "contained",
              disabled: loading,
              label: "Renew",
              onClick: this.openRenewModal
            },
              {
                id: "member-detail-open-card-modal",
                color: "primary",
                variant: "outlined",
                disabled: loading,
                label: member && member.cardId ? "Replace Fob" : "Register Fob",
                onClick: this.openCardModal
              }] as ActionButton[]: []
          ]}
          information={this.renderMemberInfo()}
          activeResourceName={resource}
          resources={(this.allowViewProfile() || admin) && [
            ...billingEnabled ?
            [{
              name: "dues",
              content: <InvoicesList member={member} />
            }] : [],
            {
              name: "rentals",
              content: (
                <RentalsList
                  member={member}
                />
              )
            }
          ]}
        />
        {this.renderMemberForms()}
        {this.renderNotifications()}
      </>
    )
  }

  private goToAgreements = () => {
    this.setState({ displayDocuments: true });
  }
  private closeAgreements = () => {
    this.setState({ displayDocuments: false });
    this.closeNotifications();
  }
  private closeNotifications = () => this.setState({ displayNotification: undefined });
  private renderNotifications = () => {
    const { displayNotification } = this.state;

    return (
      <NotificationModal
        notification={displayNotification}
        onSubmit={this.goToAgreements}
        onClose={this.closeNotifications}
      />
    );
  }

  private renderMemberForms = () => {
    const { member, admin } = this.props;
    const { isEditOpen, isRenewOpen, isCardOpen } = this.state;

    const editForm = (renderProps:UpdateMemberRenderProps) => (
      <MemberForm
        ref={renderProps.setRef}
        member={renderProps.member}
        isAdmin={admin}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isUpdating}
        error={renderProps.updateError}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
      />
    )
    const renewForm = (renderProps:UpdateMemberRenderProps) => (
      <RenewalForm
        ref={renderProps.setRef}
        renewalOptions={membershipRenewalOptions}
        title="Renew Membership"
        entity={memberToRenewal(renderProps.member)}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isUpdating}
        error={renderProps.updateError}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
        />
    )
    const accessCardForm = (renderProps:UpdateMemberRenderProps) => (
      <AccessCardForm
        ref={renderProps.setRef}
        member={renderProps.member}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isUpdating}
        error={renderProps.updateError}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
      />
    )

    return (admin &&
      <>
        <UpdateMemberContainer
          operation={CrudOperation.Update}
          isOpen={isRenewOpen}
          member={member}
          closeHandler={this.closeRenewModal}
          render={renewForm}
        />
        <UpdateMemberContainer
          operation={CrudOperation.Update}
          isOpen={isEditOpen}
          member={member}
          closeHandler={this.closeEditModal}
          render={editForm}
        />
        <UpdateMemberContainer
          operation={CrudOperation.Update}
          isOpen={isCardOpen}
          member={member}
          closeHandler={this.closeCardModal}
          render={accessCardForm}
        />
      </>
    )
  }

  public render(): JSX.Element {
    const { member, isRequestingMember, match } = this.props;
    const { memberId } = match.params;
    const { displayDocuments } = this.state;
    return (
      <>
        {isRequestingMember && <LoadingOverlay id={memberId}/>}
        {member && (
          displayDocuments ?
          <SignDocuments onSubmit={this.closeAgreements}/>
          : this.renderMemberDetails()
      )}
      </>
    )
  }
}

const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const { isRequesting, error: requestingError } = state.member.read;
  const { isRequesting: isUpdating } = state.member.update
  const { entity: member } = state.member;
  const { currentUser: { isAdmin: admin, id: currentUserId, isNewMember, subscriptionId } } = state.auth;

  return {
    admin,
    member,
    requestingError,
    currentUserId,
    isRequestingMember: isRequesting,
    isUpdatingMember: isUpdating,
    isNewMember,
    subscriptionId,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps,
): DispatchProps => {
  const memberId = ownProps.match.params.memberId;
  return {
    getMember: () => dispatch(readMemberAction(memberId)),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MemberDetail));