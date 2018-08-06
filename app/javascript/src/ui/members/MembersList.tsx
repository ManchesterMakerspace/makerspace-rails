import * as React from "react";
import { connect } from "react-redux";

import { StateProps as ReduxState } from "ui/reducer";
import { SortDirection } from "ui/common/table/constants";
import { MemberDetails } from "ui/member/interfaces";
import { readMembersAction } from "ui/members/actions";
import { QueryParams } from "app/interfaces";
import TableContainer from "ui/common/table/TableContainer";

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

const fields = [
  {
    id: "lastname",
    label: "Name",
    cell: (row) => `${row.firstname} ${row.lastname}`,
    sortable: true
  },
  {
    id: "expiration",
    label: "Expiration",
    cell: (row) => `${row.expirationTime}`,
    sortable: true
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
  private rowId = (row) => row.id;

  private onSelectCell = (id, add) => {
    const { selectedIds } = this.state;
    if (add) {
      selectedIds.push(id);
    } else {
      const index = selectedIds.indexOf(id);
      selectedIds.splice(index, 1);
    }
    this.setState({ selectedIds });
  }

  private onSelectAll = () => {
    const { members: data } = this.props;
    const { selectedIds } = this.state;
    const allIds = data.map(data => this.rowId(data));
    const newIds = (allIds.length > selectedIds.length) ? allIds : [];

    this.setState({ selectedIds: newIds })
  }

  private onSort = (prop) => {
    const orderBy = prop;
    let order = SortDirection.Desc;
    if (this.state.orderBy === orderBy && this.state.order === order) {
      order = SortDirection.Asc;
    }
    this.setState({ order, orderBy },
      this.getMembers
    );
  }
  
  private onPageChange = (newPage) => {
    this.setState({ pageNum: newPage },
      this.getMembers
    );
  }

  private onSearchEnter = (searchTerm) => {
    this.setState({ search: searchTerm },
      this.getMembers
    );
  }

  
  public render(): JSX.Element {
    const { members: data, totalItems, loading } = this.props;
    
    const { selectedIds, pageNum, order, orderBy } = this.state;
    
    return (
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
        onSelect={this.onSelectCell}
        onSelectAll={this.onSelectAll}
        onPageChange={this.onPageChange}
      />
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
  dispatch
): DispatchProps => {
  return {
    getMembers: (queryParams) => dispatch(readMembersAction(queryParams))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MembersList);