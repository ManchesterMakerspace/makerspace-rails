import * as React from "react";
import { connect } from "react-redux";
import { Button, Grid } from "@material-ui/core";

import { Subscription } from "app/entities/subscription";
import { QueryParams } from "app/interfaces";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { SortDirection } from "ui/common/table/constants";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import { readSubscriptionsAction } from "ui/subscriptions/actions";
import { timeToDate } from "ui/utils/timeToDate";


interface OwnProps { }
interface DispatchProps {
  getSubscriptions: (queryParams?: QueryParams) => void;
}
interface StateProps {
  subscriptions: Subscription[];
  totalItems: number;
  loading: boolean;
  error: string;
}
interface Props extends OwnProps, DispatchProps, StateProps { }
interface State {
  selectedIds: string[];
  pageNum: number;
  orderBy: string;
  search: string;
  order: SortDirection;
}

const fields: Column<Subscription>[] = [
  {
    id: "id",
    label: "Id",
    cell: (row: Subscription) => row.id,
  }, {
    id: "amount",
    label: "Amount",
    cell: (row: Subscription) => row.amount,
  }, {
    id: "status",
    label: "Status",
    cell: (row: Subscription) => row.status,
  }, {
    id: "nextBilling",
    label: "Next Billing Date",
    cell: (row: Subscription) => timeToDate(row.next_billing_date),
  }
];

class SubscriptionsList extends React.Component<Props, State> {

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

  public componentDidMount() {
    this.props.getSubscriptions();
  }

  private getActionButtons = (): JSX.Element => {
    return (
      <Button>Action</Button>
    )
  }

  private rowId = (row: Subscription) => row.id;

  public render(): JSX.Element {
    const { subscriptions: data, totalItems, loading, error } = this.props;


    return (
      <>
        <Grid style={{ paddingTop: 20 }}>
          {this.getActionButtons()}
        </Grid>
        <TableContainer
          id="subscriptions-table"
          title="Subscriptions"
          loading={loading}
          data={data}
          error={error}
          totalItems={totalItems}
          columns={fields}
          rowId={this.rowId}
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
    entities: subscriptions,
    read: {
      totalItems,
      isRequesting: loading,
      error
    }
  } = state.subscriptions;
  return {
    subscriptions: Object.values(subscriptions),
    totalItems,
    loading,
    error
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    getSubscriptions: (queryParams) => dispatch(readSubscriptionsAction(queryParams))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubscriptionsList);