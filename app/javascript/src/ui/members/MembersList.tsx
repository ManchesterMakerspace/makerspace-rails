import * as React from "react";
import { connect } from "react-redux";


import { StateProps as ReduxState } from "ui/reducer";
import Table from "ui/common/table/Table";
import { SortDirection } from "ui/common/table/constants";
import { MemberDetails } from "ui/member/interfaces";
import { readMembersAction } from "ui/members/actions";

interface OwnProps {}
interface DispatchProps {
  getMembers: () => void;
}
interface StateProps {
  members: MemberDetails[];
}
interface Props extends OwnProps, DispatchProps, StateProps {}
interface State {
  selectedIds: string[];
}

const fields = [
  {
    id: "name",
    label: "Name",
    cell: (row) => `${row.firstname} ${row.lastname}`
  },
  {
    id: "expiration",
    label: "Expiration",
    cell: (row) => `${row.expirationTime}`
  },
];

class MembersList extends React.Component<Props, State> {  

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedIds: []
    };
  }
  public componentDidMount() {
    this.props.getMembers();
  }

  private rowId = (row) => row.id;

  private onSelectCell = (id, direction) => {
    const { selectedIds } = this.state;
    if (direction) {
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

    if (allIds.length > selectedIds.length) {
      this.setState({ selectedIds: allIds });
    } else {
      this.setState({ selectedIds: [] });
    }
  }
  private onSort = (event, prop) => {
    console.log(prop)
  }
  
  public render(): JSX.Element {
    const { members: data } = this.props;
    const { selectedIds } = this.state;
    return (
      <Table
        id="members-table"
        page={1}
        columns={fields}
        data={data}
        selectedIds={selectedIds}
        order={SortDirection.Desc}
        orderBy={"foo"}
        rowId={this.rowId}
        onSelectionChange={this.onSelectCell}
        onSort={this.onSort}
        onSelectAll={this.onSelectAll}
      >
      </Table>
    );
  }
}

const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const { entities: members } = state.members;

  return {
    members: Object.values(members)
  }
}

const mapDispatchToProps = (
  dispatch
): DispatchProps => {
  return {
    getMembers: () => dispatch(readMembersAction())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MembersList);