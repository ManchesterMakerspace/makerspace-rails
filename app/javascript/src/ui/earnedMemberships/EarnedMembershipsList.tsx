import * as React from "react";
import { connect } from "react-redux";
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import Grid from "@material-ui/core/Grid";

import { QueryParams, CollectionOf } from "app/interfaces";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import ButtonRow from "ui/common/ButtonRow";
import { SortDirection } from "ui/common/table/constants";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import Form from "ui/common/Form";
import { CrudOperation } from "app/constants";
import { readMembershipsAction } from "ui/earnedMemberships/actions";
import { EarnedMembership } from "app/entities/earnedMembership";
import EarnedMembershipForm from "ui/earnedMemberships/EarnedMembershipForm";
import UpdateEarnedMembershipContainer, { UpdateMembershipRenderProps } from "ui/earnedMemberships/UpdateEarnedMembershipContainer";
import { displayMemberExpiration } from "ui/member/utils";
import MemberStatusLabel from "ui/member/MemberStatusLabel";


interface OwnProps extends RouteComponentProps<{}> {}
interface DispatchProps {
  getMemberships: (queryParams?: QueryParams) => void;
}
interface StateProps {
  memberships: CollectionOf<EarnedMembership>;
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
  openCreateForm: boolean;
  openEditForm: boolean;
}

const fields: Column<EarnedMembership>[] = [
  {
    id: "lastname",
    label: "Name",
    cell: (row: EarnedMembership) => <Link to={`/members/${row.memberId}`}>{row.memberName}</Link>,
    defaultSortDirection: SortDirection.Desc,
  },
  {
    id: "expirationTime",
    label: "Expiration",
    cell: (row: EarnedMembership) => displayMemberExpiration(row.memberExpiration),
    defaultSortDirection: SortDirection.Desc
  },
  {
    id: "status",
    label: "Status",
    cell: (row: EarnedMembership) => {
      const member = {
        expirationTime: row.memberExpiration,
        status: row.memberStatus,
      };
      return <MemberStatusLabel member={member} />;
    }
  },
];

class EarnedMembershipList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedId: undefined,
      pageNum: 0,
      orderBy: "",
      search: "",
      order: SortDirection.Asc,
      openCreateForm: false,
      openEditForm: false,
    };
  }

  private openCreateForm = () =>  this.setState({ openCreateForm: true });
  private closeCreateForm = () =>  this.setState({ openCreateForm: false });
  private openEditForm = () => this.setState({ openEditForm: true });
  private closeEditForm = () => this.setState({ openEditForm: false });

  private renderMemberForms = () => {
    const { memberships } = this.props;
    const { selectedId, openCreateForm, openEditForm } = this.state;


    const createForm = (renderProps: UpdateMembershipRenderProps) => {
      return (<EarnedMembershipForm
        ref={renderProps.setRef}
        membership={renderProps.membership}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isRequesting}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
        title="Create New Membership"
      />)
    }
    const editForm = (renderProps: UpdateMembershipRenderProps) => {
      return (<EarnedMembershipForm
        ref={renderProps.setRef}
        membership={renderProps.membership}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isRequesting}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
        title="Edit Membership"
      />)
    }

    const selectedMembership = memberships[selectedId];

    return (
      <>
        <UpdateEarnedMembershipContainer
          isOpen={openCreateForm}
          membership={{ } as Partial<EarnedMembership>}
          closeHandler={this.closeCreateForm}
          render={createForm}
          operation={CrudOperation.Create}
        />
        <UpdateEarnedMembershipContainer
          isOpen={openEditForm}
          membership={selectedMembership}
          closeHandler={this.closeEditForm}
          render={editForm}
          operation={CrudOperation.Update}
        />
      </>
    )
  }

  private getActionButtons = () => {
    const { selectedId } = this.state;
    return (
      <ButtonRow
        actionButtons={[{
          id: "membership-list-create",
          variant: "contained",
          color: "primary",
          onClick: this.openCreateForm,
          label: "Create New Membership"
        }, {
          id: "membership-list-edit",
          variant: "contained",
          color: "default",
          onClick: this.openEditForm,
          label: "Edit Membership",
          disabled: !selectedId
        }]}
      />
    )
  }

  private getQueryParams = (): QueryParams => {
    const {
      pageNum,
      orderBy,
      order,
      search,
    } = this.state
    return {
      pageNum,
      orderBy,
      order,
      search,
    };
  }

  public componentDidMount() {
    this.getMemberships();
  }

  public componentDidUpdate(prevProps: Props) {
    const { isCreating: wasCreating, isUpdating: wasUpdating } = prevProps;
    const { isCreating, createError, isUpdating, updateError } = this.props;


    if ((wasCreating && !isCreating && !createError) || // refresh list on create or update
      (wasUpdating && !isUpdating && !updateError)) {
      this.getMemberships(true);
    }
  }

  private getMemberships = (resetPage: boolean = false) => {
    if (resetPage) {
      this.setState({ pageNum: 0 });
    }
    this.setState({ selectedId: undefined });
    this.props.getMemberships(this.getQueryParams());
  }
  private rowId = (row: EarnedMembership) => row.id;

  private onSort = (prop: string) => {
    const orderBy = prop;
    let order = SortDirection.Desc;
    if (this.state.orderBy === orderBy && this.state.order === order) {
      order = SortDirection.Asc;
    }
    this.setState({ order, orderBy, pageNum: 0 },
      () => this.getMemberships(true)
    );
  }

  private onPageChange = (newPage: number) => {
    this.setState({ pageNum: newPage },
      this.getMemberships
    );
  }

  private onSearchEnter = (searchTerm: string) => {
    this.setState({ search: searchTerm, pageNum: 0 },
      () => this.getMemberships(true)
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
      memberships,
      totalItems,
      loading,
      error,
    } = this.props;

    const {
      selectedId,
      pageNum,
      order,
      orderBy,
    } = this.state;

    return (
      <Grid container spacing={24} justify="center">
        <Grid item md={10} xs={12}>
          <Grid style={{paddingTop: 20}}>
            {this.getActionButtons()}
          </Grid>
          <TableContainer
            id="memberships-table"
            title="Earned Memberships"
            loading={loading}
            data={Object.values(memberships)}
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
            onSelect={this.onSelect}
          />
          {this.renderMemberForms()}
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const {
    entities: memberships,
    read: {
      totalItems,
      isRequesting: loading,
      error
    },
    create: {
      isRequesting: isCreating,
      error: createError,
    },
    update: {
      isRequesting: isUpdating,
      error: updateError
    },
  } = state.earnedMemberships;
  return {
    memberships,
    totalItems,
    loading,
    error,
    isUpdating,
    updateError,
    isCreating,
    createError,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    getMemberships: (queryParams) => dispatch(readMembershipsAction(queryParams)),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EarnedMembershipList));