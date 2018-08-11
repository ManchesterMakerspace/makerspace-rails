import * as React from "react";
import { connect } from "react-redux";
import isEmpty from "lodash-es/isEmpty";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { timeToDate } from "ui/utils/timeToDate";
import { SortDirection } from "ui/common/table/constants";
import { MemberDetails, MemberStatus } from "app/entities/member";
import { readMembersAction } from "ui/members/actions";
import { QueryParams } from "app/interfaces";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import { Button, Grid } from "@material-ui/core";
import { Status } from "ui/common/constants";
import StatusLabel from "ui/common/StatusLabel";
import { memberStatusLabelMap, membershipRenewalOptions } from "ui/members/constants";
import RenewalForm, { RenewalEntity } from "ui/common/RenewalForm";
import FormModal from "ui/common/FormModal";
import { RenewForm } from "ui/interfaces";
import { updateMemberAction } from "ui/member/actions";
import { memberToRenewal } from "ui/member/utils";

interface OwnProps {}
interface DispatchProps {
  getMembers: (queryParams?: QueryParams) => void;
  updateMember: (id: string, details: Partial<MemberDetails>) => void;
}
interface StateProps {
  members: MemberDetails[];
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
    cell: (row: MemberDetails) => `${row.firstname} ${row.lastname}`,
    defaultSortDirection: SortDirection.Desc,
  },
  {
    id: "expirationTime",
    label: "Expiration",
    cell: (row: MemberDetails) => timeToDate(row.expirationTime),
    defaultSortDirection: SortDirection.Desc
  },
  {
    id: "status",
    label: "Status",
    cell: (row: MemberDetails) => {
      const inActive = row.status !== MemberStatus.Active;
      const current = row.expirationTime > Date.now();
      const statusColor = current ? Status.Success : Status.Danger;

      let label;
      if (inActive) {
        label = memberStatusLabelMap[row.status];
      } else {
        label = current ? "Active" : "Expired";
      }

      return (
        <StatusLabel label={label} color={statusColor}/>
      );
    },
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
    const selectedMember = members.find( member => member.id == selectedId );
    const renewalEntity = memberToRenewal(selectedMember);
    this.setState({ openRenewalForm: true, renewalEntity });
  }
  private closeRenewalForm = () => {
    this.setState({ openRenewalForm: false });
  }

  private submitRenewalForm = async (form: FormModal) => {
    let errors = {};
    let validRenewal: RenewForm;

    try {
      validRenewal = this.renewFormRef.validateRenewalForm();
      console.log(validRenewal);
    } catch (e) {
      errors = {
        ...errors,
        ...e
      };
    }

    form.setFormState({
      errors
    });

    if (!isEmpty(errors)) return;

    await this.props.updateMember(validRenewal.id, validRenewal);
  }

  private getActionButtons = () => {
    const { selectedId } = this.state;
    return (
      <>
        <Button variant="contained" color="primary" onClick={this.openCreateForm}>
          Create New Member
        </Button>
        <Button variant="contained" color="secondary" disabled={!selectedId} onClick={this.openRenewalForm}>
          Renew Member
        </Button>
      </>
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
      members: data,
      totalItems,
      loading,
      error,
      isUpdating,
      updateError,
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
        <Grid style={{paddingTop: 20}}>
          {this.getActionButtons()}
        </Grid>
        <TableContainer
          id="members-table"
          title="Members"
          loading={loading}
          data={data}
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

  return {
    members: Object.values(members),
    totalItems,
    loading,
    error,
    isUpdating,
    updateError
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