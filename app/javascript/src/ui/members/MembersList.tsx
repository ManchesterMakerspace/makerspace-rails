import * as React from "react";
import { connect } from "react-redux";
import { Link, Redirect } from 'react-router-dom';
import Grid from "@material-ui/core/Grid";
import isUndefined from "lodash-es/isUndefined";
import { MemberDetails, MemberStatus } from "app/entities/member";
import { QueryParams, CollectionOf } from "app/interfaces";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { displayMemberExpiration, buildProfileRouting } from "ui/member/utils";
import ButtonRow from "ui/common/ButtonRow";
import { SortDirection } from "ui/common/table/constants";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import RenewalForm from "ui/common/RenewalForm";
import Form from "ui/common/Form";
import { readMembersAction } from "ui/members/actions";
import { membershipRenewalOptions } from "ui/members/constants";
import MemberStatusLabel from "ui/member/MemberStatusLabel";
import { updateMemberAction } from "ui/member/actions";
import MemberForm from "ui/member/MemberForm";
import { memberToRenewal } from "ui/member/utils";
import UpdateMemberContainer, { UpdateMemberRenderProps } from "ui/member/UpdateMemberContainer";
import { CrudOperation } from "app/constants";

interface OwnProps {}
interface DispatchProps {
  getMembers: (queryParams?: QueryParams) => void;
  updateMember: (id: string, details: Partial<MemberDetails>, isAdmin: boolean) => void;
}
interface StateProps {
  admin: boolean;
  members: CollectionOf<MemberDetails>;
  totalItems: number;
  loading: boolean;
  error: string;
  isUpdating: boolean;
  updateError: string;
  isCreating: boolean;
  createError: string;
}
interface Props extends OwnProps, DispatchProps, StateProps {}
interface State {
  selectedId: string;
  pageNum: number;
  orderBy: string;
  search: string;
  order: SortDirection;
  openRenewalForm: boolean;
  openCreateForm: boolean;
  redirect: string;
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
      openRenewalForm: false,
      openCreateForm: false,
      redirect: undefined,
    };
  }

  private openCreateForm = () => {
    this.setState({ openCreateForm: true });
  }
  private closeCreateForm = () => {
    this.setState({ openCreateForm: false });
  }
  private openRenewalForm = () => {
    this.setState({ openRenewalForm: true });
  }
  private closeRenewalForm = () => {
    this.setState({ openRenewalForm: false });
  }

  // private submitRenewalForm = async (form: Form) => {
  //   const validRenewal: RenewForm = await this.renewFormRef.validate(form);

  //   if (!form.isValid()) return;

  //   await this.props.updateMember(validRenewal.id, validRenewal);
  // }

  private renderMemberForms = () => {
    const { admin, members } = this.props;
    const { selectedId, openRenewalForm, openCreateForm } = this.state;


    const createForm = (renderProps: UpdateMemberRenderProps) => {
      const submitCreate = async (form: Form) => {
        const newMember = await renderProps.submit(form);
        if (newMember) {
          this.setState({ redirect: buildProfileRouting(newMember.id) });
        }
      }
      return (<MemberForm
        ref={renderProps.setRef}
        member={renderProps.member}
        isAdmin={admin}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isCreating}
        error={renderProps.createError}
        onClose={renderProps.closeHandler}
        onSubmit={submitCreate}
        title="Create New Member"
      />)
    }

    const renewForm = (renderProps: UpdateMemberRenderProps) => (
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

    return (admin &&
      <>
        <UpdateMemberContainer
          isOpen={openRenewalForm}
          member={!isUndefined(selectedId) && members[selectedId]}
          closeHandler={this.closeRenewalForm}
          render={renewForm}
          operation={CrudOperation.Update}
        />
        <UpdateMemberContainer
          isOpen={openCreateForm}
          member={{ status: MemberStatus.Active } as Partial<MemberDetails>}
          closeHandler={this.closeCreateForm}
          render={createForm}
          operation={CrudOperation.Create}
        />
      </>
    )
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

  public componentDidUpdate(prevProps: Props) {
    const { isCreating: wasCreating, isUpdating: wasUpdating } = prevProps;
    const { isCreating, createError, isUpdating, updateError } = this.props;


    if ((wasCreating && !isCreating && !createError) || // refresh list on create or update
      (wasUpdating && !isUpdating && !updateError)) {
      this.getMembers();
    }
  }

  private getMembers = () => {
    console.log("Fetching members");
    this.setState({ selectedId: undefined });
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
      admin,
    } = this.props;

    const {
      selectedId,
      pageNum,
      order,
      orderBy,
      redirect
    } = this.state;

    if (redirect) {
      console.log(redirect);
      return <Redirect to={redirect}/>;
    }

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
        {this.renderMemberForms()}
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
    create: {
      isRequesting: isCreating,
      error: createError,
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
    isCreating,
    createError,
    admin
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    getMembers: (queryParams) => dispatch(readMembersAction(queryParams)),
    updateMember: (id, memberDetails, admin) => dispatch(updateMemberAction(id, memberDetails, admin)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MembersList);