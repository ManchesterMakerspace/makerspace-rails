import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from 'react-router-dom';
import * as moment from "moment";

import { MemberDetails } from "app/entities/member";

import { uploadMemberSignature } from "api/members/transactions";
import { Invoice } from "app/entities/invoice";
import { Column } from "ui/common/table/Table";
import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { timeToDate } from "ui/utils/timeToDate";
import LoadingOverlay from "ui/common/LoadingOverlay";
import KeyValueItem from "ui/common/KeyValueItem";
import { SortDirection } from "ui/common/table/constants";
import DetailView from "ui/common/DetailView";
import { readMemberAction } from "ui/member/actions";
import RenewalForm from "ui/common/RenewalForm";
import Form from "ui/common/Form";
import MemberForm from "ui/member/MemberForm";
import MemberStatusLabel from "ui/member/MemberStatusLabel";
import WelcomeModal from "ui/member/WelcomeModal";
import UpdateMemberContainer, { UpdateMemberRenderProps } from "ui/member/UpdateMemberContainer";
import { memberToRenewal } from "ui/member/utils";
import { membershipRenewalOptions } from "ui/members/constants";
import AccessCardForm from "ui/accessCards/AccessCardForm";
import InvoicesList from "ui/invoices/InvoicesList";
import RentalsList from "ui/rentals/RentalsList";
import { Rental } from "app/entities/rental";
import { Status } from "ui/constants";
import StatusLabel from "ui/common/StatusLabel";

interface DispatchProps {
  getMember: () => Promise<void>;
}
interface StateProps {
  admin: boolean;
  requestingError: string;
  isRequestingMember: boolean;
  isUpdatingMember: boolean;
  member: MemberDetails,
  currentUserId: string;
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

class MemberDetail extends React.Component<Props, State> {
  private invoiceFields: Column<Invoice>[] = [
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
      cell: (row: Invoice) => `$${row.amount}`,
      defaultSortDirection: SortDirection.Desc
    },
  ];

  private rentalFields: Column<Rental>[] = [
    {
      id: "number",
      label: "Number",
      cell: (row: Rental) => row.number,
      defaultSortDirection: SortDirection.Desc,
    },
    {
      id: "expiration",
      label: "Expiration Date",
      cell: (row: Rental) => `${moment(row.expiration).format("DD MMM YYYY")}`,
      defaultSortDirection: SortDirection.Desc,
    }, 
    ...this.props.admin && [{
      id: "member",
      label: "Member",
      cell: (row: Rental) => row.member,
      defaultSortDirection: SortDirection.Desc,
      width: 200
    }], 
    {
      id: "status",
      label: "Status",
      cell: (row: Rental) => {
        const current = row.expiration > Date.now();
        const statusColor = current ? Status.Success : Status.Danger;
        const label = current ? "Active" : "Expired";
  
        return (
          <StatusLabel label={label} color={statusColor}/>
        );
      },
    }
  ].filter(f => !!f);

  constructor(props: Props) {
    super(props);
    this.state = {
      ...defaultState,
      isWelcomeOpen: props.match.params.resource === "welcome"
    };
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
          {member.email ? <a href={`mailto:${member.email}`}>{member.email}</a> : "N/A"}
        </KeyValueItem>
        <KeyValueItem label="Membership Expiration">
          {timeToDate(member.expirationTime)}
        </KeyValueItem>
        <KeyValueItem label="Membership Status">
          <MemberStatusLabel member={member} />
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
          actionButtons={admin && [
            {
              color: "primary",
              variant: "contained",
              disabled: loading,
              label: "Renew",
              onClick: this.openRenewModal
            },
            {
              color: "primary",
              variant: "outlined",
              disabled: loading,
              label: "Edit",
              onClick: this.openEditModal
            },
            {
              color: "primary",
              variant: "outlined",
              disabled: loading,
              label: member && member.cardId ? "Replace Fob" : "Register Fob",
              onClick: this.openCardModal
            }
          ]}
          information={this.renderMemberInfo()}
          resources={!isWelcomeOpen && this.allowViewProfile() && [
            {
              name: "invoices",
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
                  fields={this.rentalFields}
                />
              )
            }
          ].filter(r => !!r)}
        />
        {this.renderMemberForms()}
        {this.renderNotifications()}
      </>
    )
  }

  private renderNotifications = () => {
    const { isWelcomeOpen, submittingSignature, submitSignatureError } = this.state;

    return (
      <WelcomeModal
        isOpen={isWelcomeOpen}
        isRequesting={submittingSignature}
        error={submitSignatureError}
        onSubmit={this.saveSignature}
      />
    );
  }

  private saveSignature = (form: Form) => {
    const { submitSignatureError, submittingSignature } = this.state;

    // Allow member to continue past modal if error submitting signature
    // Backend will send a slack notifiation if it errors so we can contact them directly
    if (!submittingSignature && submitSignatureError) {
      this.closeWelcomeModal();
    }

    // Don't request if already in progress
    if (!submittingSignature) {
      this.setState({ submittingSignature: true }, async () => {
        try {
          const response = await uploadMemberSignature();
          this.setState({ submittingSignature: false });
        } catch (e) {
          const { errorMessage } = e;
          this.setState({ submittingSignature: false, submitSignatureError: errorMessage });
        }
      })
    }
  } 

  private renderMemberForms = () => {
    const { member, admin } = this.props;
    const { isEditOpen, isRenewOpen, isCardOpen } = this.state;

    const editForm = (renderProps:UpdateMemberRenderProps) => (
      <MemberForm
        ref={renderProps.setRef}
        member={renderProps.member}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isUpdating}
        error={renderProps.error}
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
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
        />
    )
    const accessCardForm = (renderProps:UpdateMemberRenderProps) => (
      <AccessCardForm
        ref={renderProps.setRef}
        cardId={renderProps.member.cardId}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isUpdating}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
      />
    )

    return (admin &&
      <>
        <UpdateMemberContainer
          isOpen={isRenewOpen}
          member={member}
          closeHandler={this.closeRenewModal}
          render={renewForm}
        />
        <UpdateMemberContainer
          isOpen={isEditOpen}
          member={member}
          closeHandler={this.closeEditModal}
          render={editForm}
        />
        <UpdateMemberContainer
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
  const { currentUser: { isAdmin: admin, id: currentUserId } } = state.auth;

  return {
    admin,
    member,
    requestingError,
    currentUserId,
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
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MemberDetail));