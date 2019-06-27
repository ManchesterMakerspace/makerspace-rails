import * as React from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import Button from "@material-ui/core/Button";
import pick from "lodash-es/pick";

import { Invoice, Properties, InvoiceableResourceDisplay } from "app/entities/invoice";
import { QueryParams, CollectionOf } from "app/interfaces";
import { MemberDetails } from "app/entities/member";
import { CrudOperation, Routing, Whitelists } from "app/constants";

import { Action as CheckoutAction } from "ui/checkout/constants";
import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { timeToDate } from "ui/utils/timeToDate";
import { SortDirection } from "ui/common/table/constants";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import InvoiceForm from "ui/invoice/InvoiceForm";
import SettleInvoiceModal from "ui/invoice/SettleInvoiceModal";
import DeleteInvoiceModal from "ui/invoice/DeleteInvoiceModal";
import { readInvoicesAction } from "ui/invoices/actions";
import UpdateInvoiceContainer, { UpdateInvoiceRenderProps } from "ui/invoice/UpdateInvoiceContainer";
import ButtonRow, { ActionButton } from "ui/common/ButtonRow";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { Status } from "ui/constants";
import StatusLabel from "ui/common/StatusLabel";
import Form from "ui/common/Form";

interface OwnProps {
  member?: MemberDetails;
}

interface DispatchProps {
  getInvoices: (queryParams: QueryParams, admin: boolean) => void;
  resetStagedInvoices: () => void;
  stageInvoices: (invoices: CollectionOf<Invoice>) => void;
  goToCheckout: () => void;
}
interface StateProps {
  admin: boolean;
  allowCustomBilling: boolean;
  invoices: CollectionOf<Invoice>;
  totalItems: number;
  loading: boolean;
  error: string;
  isUpdating: boolean;
  updateError: string;
  isCreating: boolean;
  createError: string;
  currentUserId: string;
}
interface Props extends OwnProps, DispatchProps, StateProps { }
interface State {
  selectedIds: string[];
  pageNum: number;
  orderBy: string;
  search: string;
  order: SortDirection;
  openUpdateForm: boolean;
  openCreateForm: boolean;
  openSettleForm: boolean;
  openDeleteConfirm: boolean;
}


class InvoicesListComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { invoices, member, currentUserId } = props;
    // Select all invoices if viewing your own invoices page for quick checkout
    const invoicesList = Object.values(invoices);
    const ownAllInvoices = invoicesList.length && invoicesList.every(invoice => invoice.memberId === currentUserId);

    const selectedIds = ownAllInvoices ? Object.entries(invoices).reduce((ids, [id, invoice]) => {
      if (!invoice.settled) {
        ids.push(id);
      }
      return ids;
    }, []) : [];

    this.state = {
      selectedIds,
      pageNum: 0,
      orderBy: "",
      search: "",
      order: SortDirection.Asc,
      openUpdateForm: false,
      openCreateForm: false,
      openSettleForm: false,
      openDeleteConfirm: false,
    };
  }

  private getFields = (): Column<Invoice>[] => [
    ...this.props.member ? [] : [{
      id: "member",
      label: "Member",
      cell: (row: Invoice) => row.memberName,
      defaultSortDirection: SortDirection.Desc,
    }],
    {
      id: "resourceClass",
      label: "Type",
      cell: (row: Invoice) => InvoiceableResourceDisplay[row.resourceClass]
    },
    {
      id: "description",
      label: "Description",
      cell: (row: Invoice) => row.description,
      defaultSortDirection: SortDirection.Desc,
    },
    {
      id: "dueDate",
      label: "Due Date",
      cell: (row: Invoice) => {
        const dueDate = timeToDate(row.dueDate);
        if (row.subscriptionId) {
          return `Automatic Payment on ${dueDate}`
        } else {
          if (row.settled) {
            return "Paid"
          } else {
            return dueDate;
          }
        }
      },
      defaultSortDirection: SortDirection.Desc
    },
    {
      id: "amount",
      label: "Amount",
      cell: (row: Invoice) => numberAsCurrency(row.amount),
      defaultSortDirection: SortDirection.Desc
    },
    ...this.props.admin ? [{
      id: "settled",
      label: "Paid?",
      cell: (row: Invoice) => {
        const settleInvoice = () => {
          this.onSelect(this.rowId(row), true);
          this.openSettleInvoice();
        }
        return (row.settled ? "Yes" :
          <Button
            variant="outlined"
            color="primary"
            disabled={this.props.isUpdating}
            onClick={settleInvoice}
          >
            Mark as Paid
          </Button>
        )
      },
      defaultSortDirection: SortDirection.Desc
    }] : [],
    {
      id: "status",
      label: "Status",
      cell: (row: Invoice) => {
        const statusColor = (row.pastDue && !row.settled) ? Status.Danger : Status.Success;
        const label = row.settled ? "Paid" : (row.pastDue ? "Past Due" : "Upcoming");
        return (
          <StatusLabel label={label} color={statusColor} />
        );
      },
    }
  ];

  private openCreateForm = () => { this.setState({ openCreateForm: true });}
  private closeCreateForm = () => { this.setState({ openCreateForm: false });}
  private openUpdateForm = () => { this.setState({ openUpdateForm: true });}
  private closeUpdateForm = () => { this.setState({ openUpdateForm: false });}
  private openSettleInvoice = () => { this.setState({ openSettleForm: true });}
  private closeSettleInvoice = () => { this.setState({ openSettleForm: false });}
  private openDeleteInvoice = () => { this.setState({ openDeleteConfirm: true });}
  private closeDeleteInvoice = () => { this.setState({ openDeleteConfirm: false });}
  private goToCheckout = () =>  {
    const { selectedIds } = this.state;
    const { resetStagedInvoices, invoices, stageInvoices, goToCheckout } = this.props;
    const selectedInvoices = pick(invoices, selectedIds);
    resetStagedInvoices();
    stageInvoices(selectedInvoices);
    goToCheckout();  }

  private getActionButtons = () => {
    const { selectedIds } = this.state;
    const { admin, currentUserId, invoices, allowCustomBilling } = this.props;
    const selectedInvoices = Object.values(pick(invoices, selectedIds));
    const viewingOwnInvoices = (Object.values(invoices)).every(invoice => invoice.memberId === currentUserId);
    const payNow = viewingOwnInvoices && selectedInvoices.length && selectedInvoices.every(invoice => !invoice.settled && !invoice.subscriptionId)

    const actionButtons: ActionButton[] = [
      ...admin ? [{
            id: "invoices-list-create",
            variant: "contained",
            color: "primary",
            onClick: this.openCreateForm,
            label: "Create New Invoice"
          },
        ...allowCustomBilling ? [{
          id: "invoices-list-edit",
          variant: "outlined",
          color: "primary",
          disabled: !Array.isArray(selectedIds) || selectedIds.length !== 1,
          onClick: this.openUpdateForm,
          label: "Edit Invoice"
        }]: [], {
            id: "invoices-list-delete",
            variant: "contained",
            color: "secondary",
            disabled: !Array.isArray(selectedIds) || selectedIds.length !== 1,
            onClick: this.openDeleteInvoice,
            label: "Delete Invoice"
          }] as ActionButton[] : [],
    ...viewingOwnInvoices ? [{
            id: "invoices-list-payNow",
            style: { float: "right" },
            variant: "contained",
            color: "primary",
            disabled: !payNow,
            onClick: this.goToCheckout,
            label: "Pay Selected Dues",
          }]  as ActionButton[] : []
    ];

    return (
      <ButtonRow
        actionButtons={actionButtons}
      />
    )
  }

  private getQueryParams = (): QueryParams => {
    const { pageNum, orderBy, order, search } = this.state
    return { pageNum, orderBy, order, search };
  }

  public componentDidMount() {
    this.getInvoices();
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    const { isCreating: wasCreating, invoices: priorInvoices, loading: wasLoading, member: oldMember } = prevProps;
    const { isCreating, createError, invoices, currentUserId, loading, member } = this.props;

    // Set initial selection on initial load
    if (
        (wasLoading && !loading ) && // Has finished reading
        (prevState === this.state) // State is static - Nothing can happen during initial load
      ) {
      const viewingOwnInvoices = (Object.values(invoices)).every(invoice => invoice.memberId === currentUserId);

      const selectedIds = viewingOwnInvoices ? Object.entries(invoices).reduce((ids, [id, invoice]) => {
        if (!invoice.settled) {
          ids.push(id);
        }
        return ids;
      }, []) : [];

      this.setState({ selectedIds });
    }

    if ((wasCreating && !isCreating && !createError) || // refresh list on create
        (oldMember.id !== member.id) // or member change
       ) {
      this.getInvoices(true);
    }
  }

  private getInvoices = (resetPage: boolean = false) => {
    const { admin, getInvoices } = this.props;
    if (resetPage) {
      this.setState({ pageNum: 0 });
    }
    getInvoices(this.getQueryParams(), admin);
  }
  private rowId = (row: Invoice) => row.id;

  private onSort = (prop: string) => {
    const orderBy = prop;
    let order = SortDirection.Desc;
    if (this.state.orderBy === orderBy && this.state.order === order) {
      order = SortDirection.Asc;
    }
    this.setState({ order, orderBy, pageNum: 0 },
      () => this.getInvoices(true)
    );
  }

  private onPageChange = (newPage: number) => {
    this.setState({ pageNum: newPage },
      this.getInvoices
    );
  }

  // Only select one at a time
  private onSelect = (id: string, selected: boolean) => {
    this.setState(currentState => {
      const updatedIds = currentState.selectedIds.slice();
      const existingIndex = currentState.selectedIds.indexOf(id);
      const alreadySelected = existingIndex > -1;
      if (selected && alreadySelected) {
        return;
      } else if (alreadySelected) {
        updatedIds.splice(existingIndex, 1)
      } else {
        updatedIds.push(id)
      }
      return { selectedIds: updatedIds };
    })
  }

  private onSelectAll = () => {
    this.setState(currentState => {
      const allIds = Object.keys(this.props.invoices);
      if (currentState.selectedIds.length === allIds.length) {
        return { selectedIds: [] };
      } else {
        return { selectedIds: allIds };
      }
    })
  }

  private renderInvoiceForms = () => {
    const { selectedIds, openCreateForm, openUpdateForm, openSettleForm, openDeleteConfirm } = this.state;
    const { invoices, member, admin, allowCustomBilling } = this.props;

    const editForm = (renderProps: UpdateInvoiceRenderProps) => (
      <InvoiceForm
        ref={renderProps.setRef}
        invoice={renderProps.invoice}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isRequesting}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
        allowCustomBilling={renderProps.allowCustomBilling}
        invoiceOptions={renderProps.invoiceOptions}
        optionsLoading={renderProps.optionsLoading}
        optionsError={renderProps.optionsError}
        getInvoiceOptions={renderProps.getInvoiceOptions}
      />
    );

    const createForm = (renderProps: UpdateInvoiceRenderProps) => (
      <InvoiceForm
        ref={renderProps.setRef}
        invoice={renderProps.invoice}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isRequesting}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
        allowCustomBilling={renderProps.allowCustomBilling}
        invoiceOptions={renderProps.invoiceOptions}
        optionsLoading={renderProps.optionsLoading}
        optionsError={renderProps.optionsError}
        getInvoiceOptions={renderProps.getInvoiceOptions}
      />
    );

    const settlementModal = (renderProps: UpdateInvoiceRenderProps) => (
      <SettleInvoiceModal
        ref={renderProps.setRef}
        invoice={renderProps.invoice}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isRequesting}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
      />
    );

    const deleteModal = (renderProps: UpdateInvoiceRenderProps) => {
      const submit = async (form: Form) => {
        const success = await renderProps.submit(form);
        if (success) {
          this.setState({ selectedIds: [] }, () => this.getInvoices(true));
        }
      }
      return (
        <DeleteInvoiceModal
          ref={renderProps.setRef}
          invoice={renderProps.invoice}
          isOpen={renderProps.isOpen}
          isRequesting={renderProps.isRequesting}
          error={renderProps.error}
          onClose={renderProps.closeHandler}
          onSubmit={submit}
        />
      );
    }

    const selectedId = Array.isArray(selectedIds) && selectedIds.length === 1 && selectedIds[0];

    return (admin &&
      <>
        <UpdateInvoiceContainer
          operation={CrudOperation.Update}
          isOpen={openUpdateForm}
          invoice={invoices[selectedId]}
          closeHandler={this.closeUpdateForm}
          render={editForm}
          customBillingEnabled={allowCustomBilling}
        />
        <UpdateInvoiceContainer
          operation={CrudOperation.Create}
          isOpen={openCreateForm}
          invoice={member && { memberId: member.id, memberName: `${member.firstname} ${member.lastname}` }}
          closeHandler={this.closeCreateForm}
          render={createForm}
          customBillingEnabled={allowCustomBilling}
        />
        <UpdateInvoiceContainer
          operation={CrudOperation.Update}
          isOpen={openSettleForm}
          invoice={{
            ...invoices[selectedId],
            settled: true
          }}
          closeHandler={this.closeSettleInvoice}
          render={settlementModal}
          customBillingEnabled={allowCustomBilling}
        />
         <UpdateInvoiceContainer
          operation={CrudOperation.Delete}
          isOpen={openDeleteConfirm}
          invoice={invoices[selectedId]}
          closeHandler={this.closeDeleteInvoice}
          render={deleteModal}
          customBillingEnabled={allowCustomBilling}
        />
      </>
    );
  }

  public render(): JSX.Element {
    const {
      invoices,
      totalItems,
      loading,
      error,
    } = this.props;

    const {
      selectedIds,
      pageNum,
      order,
      orderBy,
    } = this.state;

    return (
      <>
        {this.getActionButtons()}
        <TableContainer
          id="invoices-table"
          title="Dues"
          loading={loading}
          data={Object.values(invoices)}
          error={error}
          totalItems={totalItems}
          selectedIds={selectedIds}
          pageNum={pageNum}
          columns={this.getFields()}
          order={order}
          orderBy={orderBy}
          onSort={this.onSort}
          rowId={this.rowId}
          onPageChange={this.onPageChange}
          onSelect={this.onSelect}
          onSelectAll={this.onSelectAll}
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
    entities: invoices,
    read: {
      totalItems,
      isRequesting: loading,
      error
    },
    create: {
      isRequesting: isCreating,
      error: createError
    },
  } = state.invoices;
  const {
    update: {
      isRequesting: isUpdating,
      error: updateError
    }
  } = state.invoice;
  const { currentUser: { isAdmin: admin, id: currentUserId }, permissions } = state.auth;

  return {
    admin: admin,
    allowCustomBilling: !!permissions[Whitelists.customBilling] || false,
    invoices,
    totalItems,
    loading,
    error,
    isUpdating,
    updateError,
    isCreating,
    createError,
    currentUserId,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps
): DispatchProps => {
  const { member } = ownProps;
  return {
    getInvoices: (queryParams, admin) => dispatch(readInvoicesAction(admin, {
      ...queryParams,
      ...member && {[Properties.ResourceId]: member.id},
    })),
    resetStagedInvoices: () => dispatch({
      type: CheckoutAction.ResetStagedInvoices
    }),
    stageInvoices: (invoices) => dispatch({
      type: CheckoutAction.StageInvoicesForPayment,
      data: invoices
    }),
    goToCheckout: () => dispatch(push(Routing.Checkout)),
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(InvoicesListComponent);
