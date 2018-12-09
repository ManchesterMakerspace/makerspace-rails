import * as React from "react";
import { connect } from "react-redux";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

import { Subscription } from "app/entities/subscription";
import { QueryParams, CollectionOf } from "app/interfaces";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { SortDirection } from "ui/common/table/constants";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import { readSubscriptionsAction } from "ui/subscriptions/actions";
import { timeToDate } from "ui/utils/timeToDate";
import ButtonRow from "ui/common/ButtonRow";
import DeleteSubscription from "ui/subscriptions/DeleteSubscriptionModal";
import { CrudOperation } from "app/constants";
import Form from "ui/common/Form";
import UpdateSubscriptionContainer, { UpdateSubscriptionRenderProps } from "ui/subscriptions/UpdateSubscriptionContainer";
import { numberAsCurrency } from "ui/utils/numberToCurrency";


interface OwnProps { }
interface DispatchProps {
  getSubscriptions: (queryParams?: QueryParams) => void;
}
interface StateProps {
  subscriptions: CollectionOf<Subscription>;
  totalItems: number;
  loading: boolean;
  error: string;
}
interface Props extends OwnProps, DispatchProps, StateProps { }
interface State {
  selectedId: string;
  pageNum: number;
  orderBy: string;
  search: string;
  order: SortDirection;
  openDeleteForm: boolean;
}

const fields: Column<Subscription>[] = [
  {
    id: "memberName",
    label: "Member",
    cell: (row: Subscription) => row.memberName,
  },
  {
    id: "resourceClass",
    label: "Type",
    cell: (row: Subscription) => row.resourceClass,
  }, {
    id: "amount",
    label: "Amount",
    cell: (row: Subscription) => numberAsCurrency(row.amount),
  }, {
    id: "status",
    label: "Status",
    cell: (row: Subscription) => row.status,
  }, {
    id: "nextBilling",
    label: "Next Billing Date",
    cell: (row: Subscription) => timeToDate(row.nextBillingDate),
  }
];

class SubscriptionsList extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedId: undefined,
      pageNum: 0,
      orderBy: "",
      search: "",
      order: SortDirection.Asc,
      openDeleteForm: false,
    };
  }

  public componentDidMount() {
    this.props.getSubscriptions();
  }

  private getActionButtons = (): JSX.Element => {
    const { selectedId } = this.state;
    const { loading, subscriptions } = this.props;
    return (
      <ButtonRow
        actionButtons={[
          {
            id: "subscriptions-list-delete",
            variant: "contained",
            color: "secondary",
            disabled: loading || !subscriptions[selectedId],
            onClick: this.openDeleteForm,
            label: "Cancel Subscriptoin"
          }
        ]}
      />
    )
  }

  // Only select one at a time
  private onSelect = (id: string, selected: boolean) => {
    if (selected) {
      this.setState({ selectedId: id });
    } else {
      this.setState({ selectedId: undefined });
    }
  }

  private openDeleteForm = () => this.setState({ openDeleteForm: true });
  private closeDeleteForm = () => this.setState({ openDeleteForm: false });

  private rowId = (row: Subscription) => row.id;

  private renderInvoiceForms = () => {
    const { selectedId, openDeleteForm } = this.state;
    const { subscriptions } = this.props;

    const deleteModal = (renderProps: UpdateSubscriptionRenderProps) => {
      const submit = async (form: Form) => {
        const success = await renderProps.submit(form);
        success && this.setState({ selectedId: undefined });
      }
      return (
        <DeleteSubscription
          ref={renderProps.setRef}
          subscription={renderProps.subscription}
          isOpen={renderProps.isOpen}
          isRequesting={renderProps.isRequesting}
          error={renderProps.error}
          onClose={renderProps.closeHandler}
          onSubmit={submit}
        />
      );
    }

    return (
      <>
        <UpdateSubscriptionContainer
          operation={CrudOperation.Update}
          isOpen={openDeleteForm}
          subscription={subscriptions[selectedId]}
          closeHandler={this.closeDeleteForm}
          render={deleteModal}
        />
      </>
    );
  }

  public render(): JSX.Element {
    const { subscriptions: data, totalItems, loading, error } = this.props;
    const { selectedId } = this.state;

    return (
      <>
        <Grid style={{ paddingTop: 20 }}>
          {this.getActionButtons()}
        </Grid>
        <TableContainer
          id="subscriptions-table"
          title="Subscriptions"
          loading={loading}
          data={Object.values(data)}
          error={error}
          selectedIds={[selectedId]}
          totalItems={totalItems}
          columns={fields}
          rowId={this.rowId}
          onSelect={this.onSelect}
        />
        {this.renderInvoiceForms()}
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
    subscriptions: subscriptions,
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