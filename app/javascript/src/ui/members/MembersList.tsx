import * as React from "react";
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import Grid from "@material-ui/core/Grid";

import { MemberDetails } from "app/entities/member";
import { QueryParams, CollectionOf } from "app/interfaces";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { displayMemberExpiration } from "ui/member/utils";
import Form from "ui/common/Form";
import ButtonRow from "ui/common/ButtonRow";
import { SortDirection } from "ui/common/table/constants";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import RenewalForm, { RenewalEntity, RenewForm } from "ui/common/RenewalForm";
import { readMembersAction } from "ui/members/actions";
import { membershipRenewalOptions } from "ui/members/constants";
import MemberStatusLabel from "ui/member/MemberStatusLabel";
import { updateMemberAction } from "ui/member/actions";
import { memberToRenewal } from "ui/member/utils";

interface OwnProps {}
interface DispatchProps {
  getMembers: (queryParams?: QueryParams) => void;
  updateMember: (id: string, details: Partial<MemberDetails>) => void;
}
interface StateProps {
  admin: boolean;
  members: CollectionOf<MemberDetails>;
  totalItems: number;
  loading: boolean;
  error: string;
  isUpdating: boolean;
  updateError: string;
}
interface Props extends OwnProps, DispatchProps, StateProps {}
interface State {
  selectedId: string;
  pageNum: number;
  orderBy: string;
  search: string;
  order: SortDirection;
  renewalEntity: RenewalEntity;
  openRenewalForm: boolean;
  openCreateForm: boolean;
}

const fields: Column<MemberDetails>[] = [
  {
    id: "lastname",
    label: "Name",
    cell: (row: MemberDetails) => <Link to={`/members/${row.id}`}>{row.firstname} {row.lastname}</Link>,
    defaultSortDirection: SortDirection.Desc,
  },
  {
    id: "expirationTime",
    label: "Expiration",
    cell: displayMemberExpiration,
    defaultSortDirection: SortDirection.Desc
  },
  {
    id: "status",
    label: "Status",
    cell: (row: MemberDetails) => <MemberStatusLabel member={row}/>
  },
];

class MembersList extends React.Component<Props, State> {
  private renewFormRef: RenewalForm;
  private setFormRef = (ref: RenewalForm) => this.renewFormRef = ref;

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedId: undefined,
      pageNum: 0,
      orderBy: "",
      search: "",
      order: SortDirection.Asc,
      renewalEntity: undefined,
      openRenewalForm: false,
      openCreateForm: true,
    };
  }

  private openCreateForm = () => {
    this.setState({ openCreateForm: true });
  }
  private closeCreateForm = () => {
    this.setState({ openCreateForm: false });
  }
  private openRenewalForm = () => {
    const { members } = this.props;
    const { selectedId } = this.state;
    const renewalEntity = memberToRenewal(members[selectedId]);
    this.setState({ openRenewalForm: true, renewalEntity });
  }
  private closeRenewalForm = () => {
    this.setState({ openRenewalForm: false });
  }

  private submitRenewalForm = async (form: Form) => {
    const validRenewal: RenewForm = await this.renewFormRef.validate(form);

    if (!form.isValid()) return;

    await this.props.updateMember(validRenewal.id, validRenewal);
  }

  private getActionButtons = () => {
    const { selectedId } = this.state;
    return (
      <ButtonRow
        actionButtons={[{
          id: "members-list-create",
          variant: "contained",
          color: "primary",
          onClick: this.openCreateForm,
          label: "Create New Member"
        }, {
          id: "members-list-renew",
          variant: "outlined",
          color: "primary",
          disabled: !selectedId,
          onClick: this.openRenewalForm,
          label: "Renew Member"
        }]}
      />
    )
  }

  private getQueryParams = (): QueryParams => {
    const {
      pageNum,
      orderBy,
      order,
      search
    } = this.state
    return {
      pageNum,
      orderBy,
      order,
      search
    };
  }

  public componentDidMount() {
    this.getMembers();
  }

  private getMembers = () => {
    this.props.getMembers(this.getQueryParams());
  }
  private rowId = (row: MemberDetails) => row.id;

  private onSort = (prop: string) => {
    const orderBy = prop;
    let order = SortDirection.Desc;
    if (this.state.orderBy === orderBy && this.state.order === order) {
      order = SortDirection.Asc;
    }
    this.setState({ order, orderBy, pageNum: 0 },
      this.getMembers
    );
  }

  private onPageChange = (newPage: number) => {
    this.setState({ pageNum: newPage },
      this.getMembers
    );
  }

  private onSearchEnter = (searchTerm: string) => {
    this.setState({ search: searchTerm, pageNum: 0 },
      this.getMembers
    );
  }

  // Only select one at a time
  private onSelect = (id: string, selected: boolean) => {
    if (selected) {
      this.setState({ selectedId: id });
    } else {
      this.setState({ selectedId: undefined });
    }
  }

  public render(): JSX.Element {
    const {
      members,
      totalItems,
      loading,
      error,
      isUpdating,
      updateError,
      admin,
    } = this.props;

    const {
      selectedId,
      pageNum,
      order,
      orderBy,
      renewalEntity,
      openRenewalForm,
    } = this.state;

    return (
      <>
        {admin && (
          <Grid style={{paddingTop: 20}}>
            {this.getActionButtons()}
          </Grid>
        )}
        <TableContainer
          id="members-table"
          title="Members"
          loading={loading}
          data={Object.values(members)}
          error={error}
          totalItems={totalItems}
          selectedIds={[selectedId]}
          pageNum={pageNum}
          onSearchEnter={this.onSearchEnter}
          columns={fields}
          order={order}
          orderBy={orderBy}
          onSort={this.onSort}
          rowId={this.rowId}
          onPageChange={this.onPageChange}
          onSelect={admin && this.onSelect}
        />
        <RenewalForm
          ref={this.setFormRef}
          renewalOptions={membershipRenewalOptions}
          title="Renew Membership"
          entity={renewalEntity}
          isOpen={openRenewalForm}
          isRequesting={isUpdating}
          error={updateError}
          onClose={this.closeRenewalForm}
          onSubmit={this.submitRenewalForm}
        />
      </>
    );
  }
}

const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const {
    entities: members,
    read: {
      totalItems,
      isRequesting: loading,
      error
    },
  } = state.members;
  const {
    update: {
      isRequesting: isUpdating,
      error: updateError
    }
  } = state.member;
  const { currentUser: { isAdmin: admin } } = state.auth;

  return {
    members,
    totalItems,
    loading,
    error,
    isUpdating,
    updateError,
    admin
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    getMembers: (queryParams) => dispatch(readMembersAction(queryParams)),
    updateMember: (id, memberDetails) => dispatch(updateMemberAction(id, memberDetails)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MembersList);