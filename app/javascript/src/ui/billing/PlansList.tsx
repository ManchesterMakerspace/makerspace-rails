import * as React from "react";
import { connect } from "react-redux";
import { Button, Grid } from "@material-ui/core";

import { BillingPlan } from "app/entities/billingPlan";
import { QueryParams } from "app/interfaces";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { SortDirection } from "ui/common/table/constants";
import { readMembersAction } from "ui/members/actions";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";


interface OwnProps { }
interface DispatchProps {
  getPlans: (queryParams?: QueryParams) => void;
}
interface StateProps {
  plans: BillingPlan[];
  totalItems: number;
  loading: boolean;
}
interface Props extends OwnProps, DispatchProps, StateProps { }
interface State {
  selectedIds: string[];
  pageNum: number;
  orderBy: string;
  search: string;
  order: SortDirection;
}

const fields: Column<BillingPlan>[] = [
  {
    id: "id",
    label: "ID",
    cell: (row: BillingPlan) => row.id,
  }
];

class PlansList extends React.Component<Props, State> {

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

  private openNewPlanModal = () => {
    console.log("foo");
  }

  private getActionButton = () => {
    return (
      <Button variant="contained" color="primary" onClick={(this.openNewPlanModal)}>
        Create New Billing Plan
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
    this.getPlans();
  }

  private getPlans = () => {
    this.props.getPlans(this.getQueryParams());
  }
  private rowId = (row: BillingPlan) => row.id;

  private onSort = (prop: string) => {
    const orderBy = prop;
    let order = SortDirection.Desc;
    if (this.state.orderBy === orderBy && this.state.order === order) {
      order = SortDirection.Asc;
    }
    this.setState({ order, orderBy, pageNum: 0 },
      this.getPlans
    );
  }

  private onPageChange = (newPage: number) => {
    this.setState({ pageNum: newPage },
      this.getPlans
    );
  }

  private onSearchEnter = (searchTerm: string) => {
    this.setState({ search: searchTerm, pageNum: 0 },
      this.getPlans
    );
  }


  public render(): JSX.Element {
    const { plans: data, totalItems, loading } = this.props;

    const { selectedIds, pageNum, order, orderBy } = this.state;

    return (
      <>
        <Grid style={{ paddingTop: 20 }}>
          {this.getActionButton()}
        </Grid>
        <TableContainer
          id="billing-plans-table"
          title="Billing Plans"
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
  const { entities: plans, read: { totalItems, isRequesting: loading } } = state.members;
  return {
    plans: Object.values(plans),
    totalItems,
    loading
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    getPlans: (queryParams) => dispatch(readMembersAction(queryParams))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlansList);