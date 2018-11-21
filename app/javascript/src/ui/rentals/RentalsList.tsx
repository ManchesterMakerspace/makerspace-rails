import * as React from "react";
import * as moment from "moment";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";


import { Rental, Properties } from "app/entities/rental";
import { QueryParams } from "app/interfaces";
import { MemberDetails } from "app/entities/member";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { SortDirection } from "ui/common/table/constants";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import { readRentalsAction } from "ui/rentals/actions";
import { Status } from "ui/constants";
import StatusLabel from "ui/common/StatusLabel";
import { timeToDate } from "ui/utils/timeToDate";

interface OwnProps {
  member?: MemberDetails;
  fields?: Column<Rental>[];
}
interface DispatchProps {
  getRentals: (admin: boolean, queryParams?: QueryParams) => void;
}
interface StateProps {
  rentals: Rental[];
  totalItems: number;
  loading: boolean;
  error: string;
  admin: boolean;
}
interface Props extends OwnProps, DispatchProps, StateProps { }
interface State {
  selectedIds: string[];
  pageNum: number;
  orderBy: string;
  order: SortDirection;
}

class RentalsList extends React.Component<Props, State> {
  private fields: Column<Rental>[] = [
    {
      id: "number",
      label: "Number",
      cell: (row: Rental) => row.number,
      defaultSortDirection: SortDirection.Desc,
    },
    {
      id: "description",
      label: "Description",
      cell: (row: Rental) => row.description,
    },
    {
      id: "expiration",
      label: "Expiration Date",
      cell: (row: Rental) => timeToDate(row.expiration),
      defaultSortDirection: SortDirection.Desc,
    },
    ...this.props.admin ? [{
      id: "member",
      label: "Member",
      cell: (row: Rental) => row.memberName,
      defaultSortDirection: SortDirection.Desc,
      width: 200
    }] : [],
    {
      id: "status",
      label: "Status",
      cell: (row: Rental) => {
        const current = moment(row.expiration).valueOf() > Date.now();
        const statusColor = current ? Status.Success : Status.Danger;
        const label = current ? "Active" : "Expired";

        return (
          <StatusLabel label={label} color={statusColor}/>
        );
      },
    }
  ];

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
      <Button id="rentals-list-create" variant="contained" color="primary" onClick={(this.openNewRentalModal)}>
        Create New Rental
      </Button>
    )
  }

  private getQueryParams = (): QueryParams => {
    const { pageNum, orderBy, order } = this.state
    return { pageNum, orderBy, order };
  }

  public componentDidMount() {
    this.getRentals();
  }

  private getRentals = () => {
    const { admin } = this.props;
    this.props.getRentals(admin, this.getQueryParams());
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
    const { rentals: data, totalItems, loading, error, admin } = this.props;

    const { selectedIds, pageNum, order, orderBy } = this.state;

    return (
      <>
        {
          admin && (
            this.getActionButton()
          )
        }
        <TableContainer
          id="rentals-table"
          title="Rentals"
          loading={loading}
          data={data}
          error={error}
          totalItems={totalItems}
          selectedIds={selectedIds}
          pageNum={pageNum}
          columns={this.fields}
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

  const { currentUser: { isAdmin: admin } } = state.auth;
  return {
    rentals: Object.values(rentals),
    totalItems,
    loading,
    error,
    admin,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps
): DispatchProps => {
  const { member } = ownProps;
  return {
    getRentals: (admin, queryParams) => dispatch(
      readRentalsAction(admin, {
        ...queryParams,
      ...member && { [Properties.MemberId]: member.id},
      })
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RentalsList);