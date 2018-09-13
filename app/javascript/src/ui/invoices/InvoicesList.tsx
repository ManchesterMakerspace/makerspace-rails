import * as React from "react";
import { connect } from "react-redux";
import { Button, Grid } from "@material-ui/core";

import { Invoice, Properties } from "app/entities/invoice";
import { QueryParams, CollectionOf } from "app/interfaces";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { timeToDate } from "ui/utils/timeToDate";
import { SortDirection } from "ui/common/table/constants";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import InvoiceForm from "ui/invoice/InvoiceForm";
import SettleInvoiceModal from "ui/invoice/SettleInvoiceModal";
import { readInvoicesAction } from "ui/invoices/actions";
import UpdateInvoiceContainer, { UpdateInvoiceRenderProps } from "ui/invoice/UpdateInvoiceContainer";
import { MemberRole } from "app/entities/member";

interface OwnProps {
  memberId?: string;
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
          this.onSelect(row.id, true);
          this.openSettleInvoice;
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

  private getActionButtons = () => {
    const { selectedId } = this.state;
    return (
      <>
        <Button variant="contained" color="primary" onClick={this.openCreateForm}>
          Create New Invoice
        </Button>
        <Button variant="outlined" color="primary" disabled={!selectedId} onClick={this.openUpdateForm}>
          Edit Invoice
        </Button>
      </>
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

  private onSearchEnter = (searchTerm: string) => {
    this.setState({ search: searchTerm, pageNum: 0 },
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
    const { selectedId, openCreateForm, openUpdateForm, openSettleForm } = this.state;
    const { invoices } = this.props;

    const editForm = (renderProps: UpdateInvoiceRenderProps) => (
      <InvoiceForm
        ref={renderProps.setRef}
        invoice={renderProps.invoice}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isUpdating}
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
        isRequesting={renderProps.isUpdating}
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
        isRequesting={renderProps.isUpdating}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
      />
    );

    return (
      <>
        <UpdateInvoiceContainer
          isOpen={openUpdateForm}
          invoice={invoices[selectedId]}
          closeHandler={this.closeUpdateForm}
          render={editForm}
        />
        <UpdateInvoiceContainer
          isOpen={openCreateForm}
          closeHandler={this.closeCreateForm}
          render={createForm}
        />
        <UpdateInvoiceContainer
          isOpen={openSettleForm}
          invoice={{
            ...invoices[selectedId],
            settled: true
          }}
          closeHandler={this.closeSettleInvoice}
          render={settlementModal}
        />
      </>
    )
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
        <Grid style={{ paddingTop: 20 }}>
          {this.getActionButtons()}
        </Grid>
        <TableContainer
          id="members-table"
          title="Members"
          loading={loading}
          data={Object.values(invoices)}
          error={error}
          totalItems={totalItems}
          selectedIds={[selectedId]}
          pageNum={pageNum}
          onSearchEnter={this.onSearchEnter}
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
    updateError
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps
): DispatchProps => {
  const { memberId } = ownProps;
  return {
    getInvoices: (queryParams, admin) => dispatch(readInvoicesAction(admin, {
      ...queryParams,
      filter: {
        property: Properties.MemberId,
        criteria: memberId
      }
    })),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InvoicesList);