import * as React from "react";
import { connect } from "react-redux";
import { Button, Grid } from "@material-ui/core";

import { BillingPlan } from "app/entities/billingPlan";
import { QueryParams } from "app/interfaces";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import { readPlansAction } from "ui/billing/plans/actions";


interface OwnProps { }
interface DispatchProps {
  getPlans: () => void;
}
interface StateProps {
  plans: BillingPlan[];
  totalItems: number;
  loading: boolean;
  error: string;
}
interface Props extends OwnProps, DispatchProps, StateProps { }

const fields: Column<BillingPlan>[] = [
  {
    id: "name",
    label: "Name",
    cell: (row: BillingPlan) => row.name,
  }, {
    id: "description",
    label: "Description",
    cell: (row: BillingPlan) => row.description,
  }, {
    id: "frequency",
    label: "Billing Frequency",
    cell: (row: BillingPlan) => row.billing_frequency,
  }, {
    id: "amount",
    label: "Amount",
    cell: (row: BillingPlan) => row.amount,
  }
];

class PlansList extends React.Component<Props, {}> {

  public componentDidMount() {
    this.props.getPlans();
  }

  private rowId = (row: BillingPlan) => row.id;

  public render(): JSX.Element {
    const { plans: data, totalItems, loading, error } = this.props;


    return (
      <>
        <Grid style={{ paddingTop: 20 }}>
          *Plans can only be created, modified or deleted via Braintree Control Panel
        </Grid>
        <TableContainer
          id="billing-plans-table"
          title="Billing Plans"
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
    entities: plans, 
    read: { 
      totalItems, 
      isRequesting: loading,
      error
    }
  } = state.plans;
  return {
    plans: Object.values(plans),
    totalItems,
    loading,
    error
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    getPlans: () => dispatch(readPlansAction())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlansList);