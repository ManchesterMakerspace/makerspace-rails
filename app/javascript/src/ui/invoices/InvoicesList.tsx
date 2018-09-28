import * as React from "react";
import { connect } from "react-redux";
import { Button } from "@material-ui/core";

import { Invoice, Properties } from "app/entities/invoice";
import { QueryParams, CollectionOf } from "app/interfaces";

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
import { MemberDetails } from "app/entities/member";
import ButtonRow, { ActionButton } from "ui/common/ButtonRow";
import { CrudOperation } from "app/constants";
import PaymentRequiredModal from "ui/invoices/PaymentRequiredModal";

interface OwnProps {
  member?: MemberDetails;
  fields?: Column<Invoice>[];
}
interface DispatchProps {
  getInvoices: (queryParams: QueryParams, admin: boolean) => void;
}
interface StateProps {
  admin: boolean;
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
  openPaymentNotification: boolean;
}


class InvoicesList extends React.Component<Props, State> {

  private fields: Column<Invoice>[] = [
    {
      id: "contact",
      label: "Contact",
      cell: (row: Invoice) => row.contact,
      defaultSortDirection: SortDirection.Desc,
    },
    {
      id: "dueDate",
      label: "Due Date",
      cell: (row: Invoice) => {
        const textColor = row.pastDue ? "red" : "black"
        return (
          <span style={{ color: textColor }}>
            {timeToDate(row.dueDate)}
          </span>
        )
      },
      defaultSortDirection: SortDirection.Desc
    },
    {
      id: "amount",
      label: "Amount",
      cell: (row: Invoice) => `$${row.amount}`,
      defaultSortDirection: SortDirection.Desc
    },
    {
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
            Settle Invoice
          </Button>
        )
      },
      defaultSortDirection: SortDirection.Desc
    }
  ];

  constructor(props: Props) {
    super(props);
    const { invoices } = props;
    this.state = {
      selectedIds: undefined,
      pageNum: 0,
      orderBy: "",
      search: "",
      order: SortDirection.Asc,
      openUpdateForm: false,
      openCreateForm: false,
      openSettleForm: false,
      openDeleteConfirm: false,
      openPaymentNotification: props.member && Array.isArray(invoices) && invoices.length > 0,
    };
  }

  private openCreateForm = () => { this.setState({ openCreateForm: true });}
  private closeCreateForm = () => { this.setState({ openCreateForm: false });}
  private openUpdateForm = () => { this.setState({ openUpdateForm: true });}
  private closeUpdateForm = () => { this.setState({ openUpdateForm: false });}
  private openSettleInvoice = () => { this.setState({ openSettleForm: true });}
  private closeSettleInvoice = () => { this.setState({ openSettleForm: false });}
  private openDeleteInvoice = () => { this.setState({ openDeleteConfirm: true });}
  private closeDeleteInvoice = () => { this.setState({ openDeleteConfirm: false });}
  private closePaymentNotification = () => { this.setState({ openPaymentNotification: false });}

  private getActionButtons = () => {
    const { selectedIds } = this.state;
    const { admin, currentUserId, invoices } = this.props;
    const invoiceList = (Array.isArray(selectedIds) && selectedIds.length  ? 
      selectedIds.map(id => invoices[id]) : Object.values(invoices)) || [];
    const payNow = (invoiceList).every(invoice => {
      console.log(invoice);
      return invoice.memberId === currentUserId
    })

    const payLabel = `Pay Invoice${(invoiceList).length > 1 ? `s` : ''} (${invoiceList.length})`
    const actionButtons: ActionButton[] = [
      ...(admin && [{
        variant: "contained",
        color: "primary",
        onClick: this.openCreateForm,
        label: "Create New Invoice"
      }, {
        variant: "outlined",
        color: "primary",
        disabled: !Array.isArray(selectedIds) || selectedIds.length !== 1,
        onClick: this.openUpdateForm,
        label: "Edit Invoice"
      }, {
        variant: "outlined",
        color: "primary",
        disabled: !Array.isArray(selectedIds) || selectedIds.length !== 1,
        onClick: this.openDeleteInvoice,
        label: "Delete Invoice"
      }] as ActionButton[] || []),
    ...[payNow && {
        variant: "contained",
        color: "primary",
        onClick: this.openCreateForm,
        label: payLabel
      }]  as ActionButton[]
    ].filter(b => !!b);
    
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

  public componentDidUpdate(prevProps: Props) {
    const { isCreating: wasCreating } = prevProps;
    const { isCreating, createError } = this.props;
    if (wasCreating && !isCreating && !createError) {
      this.getInvoices();
    }
  }

  private getInvoices = () => {
    const { admin, getInvoices } = this.props;
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
      this.getInvoices
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
      if (existingIndex > -1) {
        updatedIds.splice(existingIndex, 1)
      } else {
        updatedIds.push(id)
      }
      this.setState({ selectedIds: updatedIds });
    })
  }

  private renderInvoiceForms = () => {
    const { selectedIds, openCreateForm, openUpdateForm, openSettleForm, openDeleteConfirm } = this.state;
    const { invoices, member, admin } = this.props;

    const editForm = (renderProps: UpdateInvoiceRenderProps) => (
      <InvoiceForm
        ref={renderProps.setRef}
        invoice={renderProps.invoice}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isRequesting}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
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
      const close = () => {
        this.setState({ selectedIds: undefined });
        renderProps.closeHandler();
      }
      return (
        <DeleteInvoiceModal
          ref={renderProps.setRef}
          invoice={renderProps.invoice}
          isOpen={renderProps.isOpen}
          isRequesting={renderProps.isRequesting}
          error={renderProps.error}
          onClose={close}
          onSubmit={renderProps.submit}
        />
      );
    }

    return (admin &&
      <>
        {/* <UpdateInvoiceContainer
          operation={CrudOperation.Update}
          isOpen={openUpdateForm}
          invoice={invoices[selectedId]}
          closeHandler={this.closeUpdateForm}
          render={editForm}
        />
        <UpdateInvoiceContainer
          operation={CrudOperation.Create}
          isOpen={openCreateForm}
          invoice={member && { resourceId: member.id, contact: member.email }}
          closeHandler={this.closeCreateForm}
          render={createForm}
        /> */}
        <UpdateInvoiceContainer
          operation={CrudOperation.Update}
          isOpen={openSettleForm}
          invoice={{
            ...invoices[selectedIds[0]],
            settled: true
          }}
          closeHandler={this.closeSettleInvoice}
          render={settlementModal}
        />
         <UpdateInvoiceContainer
          operation={CrudOperation.Delete}
          isOpen={openDeleteConfirm}
          invoice={invoices[selectedIds[0]]}
          closeHandler={this.closeDeleteInvoice}
          render={deleteModal}
        />
      </>
    );
  }

  private renderPaymentNotifiation = () => {
    const { loading, error, invoices } = this.props;
    const { openPaymentNotification } = this.state;

    return (
      <PaymentRequiredModal
        isOpen={openPaymentNotification}
        onClose={this.closePaymentNotification}
        isRequesting={loading}
        error={error}
        invoices={invoices}
      />
    )
  }

  private getFields = () => {
    return [
      ...this.props.fields || this.fields,
      ...[this.props.admin && {
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
              Settle Invoice
            </Button>
          )
        },
        defaultSortDirection: SortDirection.Desc
      }]
    ].filter(f => !!f);
  }

  public render(): JSX.Element {
    const {
      invoices,
      totalItems,
      loading,
      error,
      admin
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
          onSelect={admin && this.onSelect}
        />
        {this.renderInvoiceForms()}
        {this.renderPaymentNotifiation()}
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
  const { currentUser: { isAdmin: admin, id: currentUserId } } = state.auth;
  return {
    admin,
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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InvoicesList);