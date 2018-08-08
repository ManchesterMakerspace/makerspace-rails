import * as React from "react";
import { connect } from "react-redux";
import { Button, Grid } from "@material-ui/core";
import * as moment from "moment";

import { Rental } from "app/entities/rental";
import { QueryParams } from "app/interfaces";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { SortDirection } from "ui/common/table/constants";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import { readRentalsAction } from "ui/rentals/actions";
import { Status } from "ui/constants";
import StatusLabel from "ui/common/StatusLabel";


interface OwnProps { }
interface DispatchProps {
  getRentals: (queryParams?: QueryParams) => void;
}
interface StateProps {
  rentals: Rental[];
  totalItems: number;
  loading: boolean;
  error: string;
}
interface Props extends OwnProps, DispatchProps, StateProps { }
interface State {
  selectedIds: string[];
  pageNum: number;
  orderBy: string;
  order: SortDirection;
}

const fields: Column<Rental>[] = [
  {
    id: "number",
    label: "Number",
    cell: (row: Rental) => row.number,
    defaultSortDirection: SortDirection.Desc,
  },{
    id: "expiration",
    label: "Expiration Date",
    cell: (row: Rental) => `${moment(row.expiration).format("DD MMM YYYY")}`,
    defaultSortDirection: SortDirection.Desc,
  }, {
    id: "member",
    label: "Member",
    cell: (row: Rental) => row.member,
    defaultSortDirection: SortDirection.Desc,
    width: 200
  }, {
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
];

class RentalsList extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedIds: [],
      pageNum: 0,
      orderBy: "",
      order: SortDirection.Asc
    };
  }

  private openNewRentalModal = () => {
    console.log("foo");
  }

  private getActionButton = () => {
    return (
      <Button variant="contained" color="primary" onClick={(this.openNewRentalModal)}>
        Create New Rental
      </Button>
    )
  }

  private getQueryParams = (): QueryParams => {
    const {
      pageNum,
      orderBy,
      order,
    } = this.state
    return {
      pageNum,
      orderBy,
      order,
    };
  }
  public componentDidMount() {
    this.getRentals();
  }

  private getRentals = () => {
    this.props.getRentals(this.getQueryParams());
  }
  private rowId = (row: Rental) => row.id;

  private onSort = (prop: string) => {
    const orderBy = prop;
    let order = SortDirection.Desc;
    if (this.state.orderBy === orderBy && this.state.order === order) {
      order = SortDirection.Asc;
    }
    this.setState({ order, orderBy, pageNum: 0 },
      this.getRentals
    );
  }

  private onPageChange = (newPage: number) => {
    this.setState({ pageNum: newPage },
      this.getRentals
    );
  }

  public render(): JSX.Element {
    const { rentals: data, totalItems, loading, error } = this.props;

    const { selectedIds, pageNum, order, orderBy } = this.state;

    return (
      <>
        <Grid style={{ paddingTop: 20 }}>
          {this.getActionButton()}
        </Grid>
        <TableContainer
          id="rentals-table"
          title="Rentals"
          loading={loading}
          data={data}
          error={error}
          totalItems={totalItems}
          selectedIds={selectedIds}
          pageNum={pageNum}
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
  const { 
    entities: rentals, 
    read: { 
      totalItems, 
      isRequesting: loading,
      error 
    } 
  } = state.rentals;
  return {
    rentals: Object.values(rentals),
    totalItems,
    loading,
    error
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    getRentals: (queryParams) => dispatch(readRentalsAction(queryParams))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RentalsList);