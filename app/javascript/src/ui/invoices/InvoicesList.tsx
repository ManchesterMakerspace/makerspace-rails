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
import { MemberRole, MemberDetails } from "app/entities/member";
import ButtonRow from "ui/common/ButtonRow";
import { CrudOperation } from "app/constants";

interface OwnProps {
  member?: MemberDetails;
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
}
interface Props extends OwnProps, DispatchProps, StateProps { }
interface State {
  selectedId: string;
  pageNum: number;
  orderBy: string;
  search: string;
  order: SortDirection;
  openUpdateForm: boolean;
  openCreateForm: boolean;
  openSettleForm: boolean;
  openDeleteConfirm: boolean;
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
      id: "due_date",
      label: "Due Date",
      cell: (row: Invoice) => {
        const textColor = row.past_due ? "red" : "black"
        return (
          <span style={{ color: textColor }}>
            {timeToDate(row.due_date)}
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
    this.state = {
      selectedId: undefined,
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

  private openCreateForm = () => {
    this.setState({ openCreateForm: true });
  }
  private closeCreateForm = () => {
    this.setState({ openCreateForm: false });
  }
  private openUpdateForm = () => {
    this.setState({ openUpdateForm: true });
  }
  private closeUpdateForm = () => {
    this.setState({ openUpdateForm: false });
  }
  private openSettleInvoice = () => {
    this.setState({ openSettleForm: true });
  }
  private closeSettleInvoice = () => {
    this.setState({ openSettleForm: false });
  }
  private openDeleteInvoice = () => {
    this.setState({ openDeleteConfirm: true });
  }
  private closeDeleteInvoice = () => {
    this.setState({ openDeleteConfirm: false });
  }

  private getActionButtons = () => {
    const { selectedId } = this.state;
    const { admin } = this.props;
    return (admin &&
      <ButtonRow
        actionButtons={[{
          variant: "contained",
          color: "primary",
          onClick: this.openCreateForm,
          label: "Create New Invoice"
        }, {
          variant: "outlined",
          color: "primary",
          disabled: !selectedId,
          onClick: this.openUpdateForm,
          label: "Edit Invoice"
        }, {
          variant: "outlined",
          color: "primary",
          disabled: !selectedId,
          onClick: this.openDeleteInvoice,
          label: "Delete Invoice"
        }]}
      />
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
    if (selected) {
      this.setState({ selectedId: id });
    } else {
      this.setState({ selectedId: undefined });
    }
  }

  private renderInvoiceForms = () => {
    const { selectedId, openCreateForm, openUpdateForm, openSettleForm, openDeleteConfirm } = this.state;
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
        this.setState({ selectedId: undefined });
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
        <UpdateInvoiceContainer
          operation={CrudOperation.Update}
          isOpen={openUpdateForm}
          invoice={invoices[selectedId]}
          closeHandler={this.closeUpdateForm}
          render={editForm}
        />
        <UpdateInvoiceContainer
          operation={CrudOperation.Create}
          isOpen={openCreateForm}
          invoice={member && { memberId: member.id, contact: member.email }}
          closeHandler={this.closeCreateForm}
          render={createForm}
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
        />
         <UpdateInvoiceContainer
          operation={CrudOperation.Delete}
          isOpen={openDeleteConfirm}
          invoice={invoices[selectedId]}
          closeHandler={this.closeDeleteInvoice}
          render={deleteModal}
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
      selectedId,
      pageNum,
      order,
      orderBy,
    } = this.state;

    return (
      <>
        {this.getActionButtons()}
        <TableContainer
          id="invoices-table"
          title="Invoices"
          loading={loading}
          data={Object.values(invoices)}
          error={error}
          totalItems={totalItems}
          selectedIds={[selectedId]}
          pageNum={pageNum}
          columns={this.fields}
          order={order}
          orderBy={orderBy}
          onSort={this.onSort}
          rowId={this.rowId}
          onPageChange={this.onPageChange}
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
  const { currentUser } = state.auth;
  const admin = currentUser && currentUser.role.includes(MemberRole.Admin);
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
      ...member && {[Properties.MemberId]: member.id},
    })),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InvoicesList);