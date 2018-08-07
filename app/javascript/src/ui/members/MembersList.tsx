import * as React from "react";
import { connect } from "react-redux";

import * as moment from "moment";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { SortDirection } from "ui/common/table/constants";
import { MemberDetails, MemberStatus } from "app/entities/member";
import { readMembersAction } from "ui/members/actions";
import { QueryParams } from "app/interfaces";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import { Button, Grid } from "@material-ui/core";
import { Status } from "ui/common/constants";
import StatusLabel from "ui/common/StatusLabel";
import { memberStatusLabelMap } from "ui/members/constants";

interface OwnProps {}
interface DispatchProps {
  getMembers: (queryParams?: QueryParams) => void;
}
interface StateProps {
  members: MemberDetails[];
  totalItems: number;
  loading: boolean;
}
interface Props extends OwnProps, DispatchProps, StateProps {}
interface State {
  selectedIds: string[];
  pageNum: number;
  orderBy: string;
  search: string;
  order: SortDirection;
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
    cell: (row: MemberDetails) => `${moment(row.expirationTime).format("DD MMM YYYY")}`,
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

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedIds: [],
      pageNum: 0,
      orderBy: "",
      search: "",
      order: SortDirection.Asc
    };
  }

  private promptNewMember = () => {
    console.log("foo");
  }

  private getActionButton = () => {
    return (
      <Button variant="contained" color="primary" onClick={this.promptNewMember}>
        Create New Member
      </Button>
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


  public render(): JSX.Element {
    const { members: data, totalItems, loading } = this.props;

    const { selectedIds, pageNum, order, orderBy } = this.state;

    return (
      <>
        <Grid style={{paddingTop: 20}}>
          {this.getActionButton()}
        </Grid>
        <TableContainer
          id="members-table"
          title="Members"
          loading={loading}
          data={data}
          totalItems={totalItems}
          selectedIds={selectedIds}
          pageNum={pageNum}
          onSearchEnter={this.onSearchEnter}
          columns={fields}
          order={order}
          orderBy={orderBy}
          onSort={this.onSort}
          rowId={this.rowId}
          onPageChange={this.onPageChange}
        />
      </>
    );
  }
}

const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const { entities: members, read: { totalItems, isRequesting: loading }} = state.members;
  return {
    members: Object.values(members),
    totalItems,
    loading
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    getMembers: (queryParams) => dispatch(readMembersAction(queryParams))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MembersList);