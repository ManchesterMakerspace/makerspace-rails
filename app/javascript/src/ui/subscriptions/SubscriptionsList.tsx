import * as React from "react";
import { connect } from "react-redux";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";


import { Subscription } from "app/entities/subscription";
import { CollectionOf } from "app/interfaces";

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
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { SubscriptionQueryParams } from "api/subscriptions/transactions";


interface OwnProps { }
interface DispatchProps {
  getSubscriptions: (queryParams?: SubscriptionQueryParams) => void;
}
interface StateProps {
  isAdmin: boolean;
  subscriptions: CollectionOf<Subscription>;
  totalItems: number;
  loading: boolean;
  error: string;
  isWriting: boolean;
  writeError: string;
}
interface Props extends OwnProps, DispatchProps, StateProps { }
interface State {
  hideCanceled: boolean;
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
      hideCanceled: true,
      selectedId: undefined,
      pageNum: 0,
      orderBy: "",
      search: "",
      order: SortDirection.Asc,
      openDeleteForm: false,
    };
  }

  private getSubscriptions = () => {
    const { hideCanceled } = this.state;
    this.props.getSubscriptions({
      ...hideCanceled && {
        hideCanceled
      }
    })
  }

  public componentDidMount() {
    this.getSubscriptions();
  }

  public componentDidUpdate = (prevProps: Props) => {
    const { isWriting, writeError } = this.props;
    const { isWriting: wasWriting } = prevProps;

    if (wasWriting && !isWriting && !writeError) {
      this.getSubscriptions();
    }
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
            label: "Cancel Subscription"
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
    const { subscriptions, isAdmin } = this.props;

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
          operation={CrudOperation.Delete}
          isOpen={openDeleteForm}
          isAdmin={isAdmin}
          subscription={subscriptions[selectedId]}
          closeHandler={this.closeDeleteForm}
          render={deleteModal}
        />
      </>
    );
  }

  private toggleSubscriptionView = () =>
    this.setState(state => ({ hideCanceled: !state.hideCanceled }), this.getSubscriptions)

  public render(): JSX.Element {
    const { subscriptions: data, totalItems, loading, error } = this.props;
    const { selectedId, hideCanceled } = this.state;

    return (
      <>
        <Grid style={{ paddingTop: 20 }}>
          {this.getActionButtons()}
        </Grid>
        <Grid>
          <FormControlLabel
            control={
              <Checkbox
                name="hide-canceled"
                value="hide-canceled"
                id="hide-cancelled"
                checked={!!hideCanceled}
                onChange={this.toggleSubscriptionView}
                color="default"
              />
            }
            label="Hide cancelled subscriptions."
          />
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
    },
    delete: {
      isRequesting: isWriting,
      error: writeError,
    }
  } = state.subscriptions;
  const { currentUser: { isAdmin } } = state.auth;
  return {
    subscriptions: subscriptions,
    isAdmin,
    totalItems,
    loading,
    error,
    isWriting,
    writeError,
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