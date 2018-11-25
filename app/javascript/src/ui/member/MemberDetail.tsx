import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { MemberDetails } from "app/entities/member";

import { Invoice } from "app/entities/invoice";
import { Column } from "ui/common/table/Table";
import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { displayMemberExpiration } from "ui/member/utils";
import { timeToDate } from "ui/utils/timeToDate";
import LoadingOverlay from "ui/common/LoadingOverlay";
import KeyValueItem from "ui/common/KeyValueItem";
import { SortDirection } from "ui/common/table/constants";
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
import { numberAsCurrency } from "ui/utils/numberToCurrency";
import StatusLabel from "ui/common/StatusLabel";
import { Status } from "ui/common/constants";
import { ActionButton } from "ui/common/ButtonRow";

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
  isWelcomeOpen: boolean;
  isInvoiceNotificationOpen: boolean;
  submittingSignature: boolean;
  submitSignatureError: string;
}
const defaultState = {
  isEditOpen: false,
  isRenewOpen: false,
  isCardOpen: false,
  isWelcomeOpen: false,
  isInvoiceNotificationOpen: false,
  submittingSignature: false,
  submitSignatureError: ""
}

const allowedResources = new Set(["dues, rentals"]);

class MemberDetail extends React.Component<Props, State> {
  private invoiceFields: Column<Invoice>[] = [
    {
      id: "description",
      label: "Description",
      cell: (row: Invoice) => row.description,
      defaultSortDirection: SortDirection.Desc,
    },
    {
      id: "dueDate",
      label: "Due Date",
      cell: (row: Invoice) => {
        const textColor = row.pastDue ? "red" : "black"
        return (
          <span style={{ color: textColor }}>
            {timeToDate(row.dueDate)}
          </span>
        )
      },
      defaultSortDirection: SortDirection.Desc
    },
    {
      id: "amount",
      label: "Amount",
      cell: (row: Invoice) => numberAsCurrency(row.amount),
      defaultSortDirection: SortDirection.Desc
    },
    {
      id: "status",
      label: "Status",
      cell: (row: Invoice) => {
        const statusColor = row.pastDue ? Status.Danger : Status.Success;
        let label;
        if (row.pastDue) {
          label = "Past Due";
        } else {
          if (row.subscriptionId) {
            label = "Upcoming - Automatic"
          } else {
            label = "Due";
          }
        }

        return (
          <StatusLabel label={label} color={statusColor} />
        );
      },
    }
  ];

  constructor(props: Props) {
    super(props);

    this.state = {
      ...defaultState,
      isWelcomeOpen: props.isNewMember || false
    };
  }

  public componentDidMount() {
    this.props.getMember();
  }

  public componentDidUpdate(prevProps: Props) {
    const oldMemberId = prevProps.match.params.memberId;
    const { isRequestingMember: wasRequesting } = prevProps;
    const { currentUserId, admin, isRequestingMember, match, getMember, member, history, match: { params: { resource } } } = this.props;
    const { memberId } = match.params;
    if (oldMemberId !== memberId && !isRequestingMember) {
      getMember();
    }
    if (wasRequesting && !isRequestingMember) {
      if (member) {
        if (resource && !allowedResources.has(resource)) {
          history.push(Routing.Profile.replace(Routing.PathPlaceholder.MemberId, currentUserId))
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
  private closeWelcomeModal = () => this.setState({ isWelcomeOpen: false });

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
          <span id="member-detail-type">{member.subscriptionId ? "Subscription" : "Monthly"}</span>
        </KeyValueItem>
      </>
    )
  }

  private allowViewProfile = () => {
    const { currentUserId, admin } = this.props;
    return this.props.match.params.memberId === currentUserId || admin;
  }

  private renderMemberDetails = (): JSX.Element => {
    const { member, isUpdatingMember, isRequestingMember, match, admin } = this.props;
    const { memberId } = match.params;
    const loading = isUpdatingMember || isRequestingMember;
    const { isWelcomeOpen } = this.state;
    return (
      <>
        <DetailView
          title={`${member.firstname} ${member.lastname}`}
          basePath={`/members/${memberId}`}
          actionButtons={[
            {
              id: "member-detail-open-edit-modal",
              color: "primary",
              variant: "outlined",
              disabled: loading,
              label: "Edit",
              onClick: this.openEditModal
            },
            ...admin ? [{
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
          resources={!isWelcomeOpen && this.allowViewProfile() && [
            {
              name: "dues",
              content: (
                <InvoicesList
                  member={member}
                  fields={this.invoiceFields}
                />
              )
            },
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
        {/* {this.renderNotifications()} */}
      </>
    )
  }

  // private renderNotifications = () => {
  //   const { isWelcomeOpen, submittingSignature, submitSignatureError } = this.state;

  //   return (
  //     <WelcomeModal
  //       isOpen={isWelcomeOpen}
  //       isRequesting={submittingSignature}
  //       error={submitSignatureError}
  //       onSubmit={this.saveSignature}
  //     />
  //   );
  // }

  // private saveSignature = (form: Form) => {
  //   const { submitSignatureError, submittingSignature } = this.state;

  //   // Allow member to continue past modal if error submitting signature
  //   // Backend will send a slack notifiation if it errors so we can contact them directly
  //   if (!submittingSignature && submitSignatureError) {
  //     this.closeWelcomeModal();
  //   }

  //   // Don't request if already in progress
  //   if (!submittingSignature) {
  //     this.setState({ submittingSignature: true }, async () => {
  //       try {
  //         const response = await uploadMemberSignature();
  //         this.setState({ submittingSignature: false });
  //       } catch (e) {
  //         const { errorMessage } = e;
  //         this.setState({ submittingSignature: false, submitSignatureError: errorMessage || "There was an error saving your signature." });
  //       }
  //     })
  //   }
  // }

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
    return (
      <>
        {isRequestingMember && <LoadingOverlay id={memberId}/>}
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