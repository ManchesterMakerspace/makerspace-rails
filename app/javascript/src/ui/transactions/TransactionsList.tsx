import * as React from "react";
import * as moment from "moment";
import { connect } from "react-redux";
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";

import { Transaction, TransactionStatus } from "app/entities/transaction";
import { QueryParams, CollectionOf } from "app/interfaces";
import { MemberDetails } from "app/entities/member";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { SortDirection } from "ui/common/table/constants";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import { readTransactionsAction } from "ui/transactions/actions";
import { timeToDate, toDatePicker, dateToTime } from "ui/utils/timeToDate";
import { CrudOperation } from "app/constants";
import UpdateTransactionContainer, { UpdateTransactionRenderProps } from "ui/transactions/UpdateTransactionContainer";
import RefundTransactionModal from "ui/transactions/RefundTransactionModal";
import ButtonRow, { ActionButton } from "ui/common/ButtonRow";
import Form from "ui/common/Form";
import { TransactionSearchCriteria } from "api/transactions/interfaces";
import AsyncSelectFixed, { SelectOption } from "ui/common/AsyncSelect";
import { getMembers } from "api/members/transactions";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { renderTransactionStatus } from "ui/transactions/utils";

interface OwnProps extends RouteComponentProps<{}> {
  member?: MemberDetails;
  fields?: Column<Transaction>[];
}
interface DispatchProps {
  getTransactions: (admin: boolean, queryParams?: QueryParams) => void;
}
interface StateProps {
  transactions: CollectionOf<Transaction>;
  totalItems: number;
  isReading: boolean;
  readError: string;
  admin: boolean;
}
interface Props extends OwnProps, DispatchProps, StateProps { }
interface State {
  selectedId: string;
  pageNum: number;
  orderBy: string;
  order: SortDirection;
  startDate: Date | string;
  endDate: Date | string;
  modalOperation: CrudOperation;
  openTransactionForm: boolean;
  member: SelectOption;
}

class TransactionsList extends React.Component<Props, State> {
  private fields: Column<Transaction>[] = [
    {
      id: "createdAt",
      label: "Date",
      cell: (row: Transaction) => timeToDate(row.createdAt),
      defaultSortDirection: SortDirection.Desc,
    },
    {
      id: "amount",
      label: "Amount",
      cell: (row: Transaction) => {
        const amount = Number(row.amount);
        const discount = Number(row.discountAmount);
        let total = amount;
        if (discount) {
          total -= discount;
        }

        const totalAsText = numberAsCurrency(total);
        if (row.refundedTransactionId) {
          return `(${totalAsText})`; 
        }
        return totalAsText;
      },
      defaultSortDirection: SortDirection.Desc,
    },
    {
      id: "description",
      label: "Description",
      cell: (row: Transaction) => {
        let description = "";
        if (row.refundedTransactionId) {
          description +=  "Refund"
        } else if (row.subscriptionId) {
          description += "Subscription Payment"
        } else {
          description += "Standard Payment"
        }

        if (row.invoice) {
          description += ` for ${row.invoice.name}`;
        }

        return description;
      },
    },
    ...this.props.member ? []: [{
      id: "member",
      label: "Member",
      cell: (row: Transaction) => {
        if (row.memberId) {
          return <Link to={`/members/${row.memberId}`}>{row.memberName}</Link>
        }

        if (row.customerDetails) {
          return `${row.customerDetails.first_name} ${row.customerDetails.last_name}`;
        }
        return "Unknown";
      },
      width: 200
    }],
    {
      id: "status",
      label: "Status",
      cell: renderTransactionStatus
    }
  ];

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedId: undefined,
      pageNum: 0,
      orderBy: "",
      order: SortDirection.Asc,
      startDate: new Date(moment().subtract(1, "day").valueOf()),
      endDate: new Date(),
      modalOperation: undefined,
      openTransactionForm: false,
      member: undefined,
    };
  }

  private openDeleteModal = () => this.openTransactionModal(CrudOperation.Delete);
  private openTransactionModal = (operation: CrudOperation) => this.setState({ openTransactionForm: true, modalOperation: operation });
  private closeTransactionModal = () => { this.setState({ openTransactionForm: false }); };

  private getActionButtons = () => {
    const { selectedId } = this.state;
    const { admin, transactions } = this.props;
    const transaction = transactions && selectedId && transactions[selectedId];

    // Disable if invoice already refunded or not yet settled
    let disabled: boolean = true;
    let label: string = "Refund transaction";
    if (transaction) {
      if (transaction.status !== TransactionStatus.Settled) {
        disabled = true;
        label = "Transaction in progress";
      } else {
        if (admin) {
          label = "Refund Transaction";
          disabled = !!transaction.refundedTransactionId;
        } else {
          label = "Request Refund";
          disabled = !!transaction.refundedTransactionId || 
                     !!(transaction.invoice && transaction.invoice.refundRequested)
        }
      }
    }

    const actionButtons: ActionButton[] = [
      {
        label,
        id: "transactions-list-delete",
        variant: "contained",
        color: "secondary",
        disabled: disabled,
        onClick: this.openDeleteModal,
      },
    ];

    return (
      <ButtonRow
        actionButtons={actionButtons}
      />
    )
  }

  private getQueryParams = (): QueryParams => {
    const { pageNum, orderBy, order, startDate, endDate, member } = this.state
    return {
      pageNum,
      orderBy,
      order,
      startDate,
      endDate,
      ...member && {
        searchBy: TransactionSearchCriteria.Member,
        searchId: member.id,
      }
    };
  }

  public componentDidMount() {
    this.getTransactions();
  }

  public componentDidUpdate(prevProps: Props) {
    const { member: oldMember } = prevProps;
    const { member } = this.props;

    if ((oldMember && oldMember.id) !== (member && member.id)) { // or member change
      this.getTransactions(true);
    }
  }

  private getTransactions = (resetPage: boolean = false) => {
    const { admin, member } = this.props;
    if (resetPage) {
      this.setState({ pageNum: 0 });
    }
    if (member && !member.customerId) {
      return;
    }
    this.props.getTransactions(admin, this.getQueryParams());
  }
  private rowId = (row: Transaction) => row.id;

  private onSort = (prop: string) => {
    const orderBy = prop;
    let order = SortDirection.Desc;
    if (this.state.orderBy === orderBy && this.state.order === order) {
      order = SortDirection.Asc;
    }
    this.setState({ order, orderBy, pageNum: 0 },
      () => this.getTransactions(true)
    );
  }

  private onPageChange = (newPage: number) => {
    this.setState({ pageNum: newPage },
      this.getTransactions
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

  // Need to update internal state and set form value since input is otherwise a controlled input
  private updateMemberValue = (newMember: SelectOption) => {
    this.setState({ member: newMember }, () => this.getTransactions(true));
  }

  private memberOptions = async (searchValue: string) => {
    try {
      const membersResponse = await getMembers({ search: searchValue });
      const members: MemberDetails[] = membersResponse.data ? membersResponse.data.members : [];
      const memberOptions = members.map(member => ({ value: member.email, label: `${member.firstname} ${member.lastname}`, id: member.id }));
      return memberOptions;
    } catch (e) {
      console.log(e);
    }
  }

  private renderInvoiceForms = () => {
    const { selectedId, openTransactionForm, modalOperation } = this.state;
    const { transactions, member, admin } = this.props;

    const refundModal = (renderProps: UpdateTransactionRenderProps) => {
      const submit = async (form: Form) => {
        const success = await renderProps.submit(form);
        if (success) {
          this.setState({ selectedId: undefined, pageNum: 0 },
            this.getTransactions);
        }
      }
      return (
        <RefundTransactionModal
          ref={renderProps.setRef}
          transaction={renderProps.transaction}
          isOpen={renderProps.isOpen}
          isRequesting={renderProps.isRequesting}
          error={renderProps.error}
          onClose={renderProps.closeHandler}
          onSubmit={submit}
          isAdmin={admin}
        />
      );
    }

    const selectedTransaction = transactions[selectedId];

    return (admin &&
      <>
        {!!selectedTransaction && (
          <>
            <UpdateTransactionContainer
              operation={CrudOperation.Delete}
              isAdmin={admin}
              isOpen={openTransactionForm && modalOperation === CrudOperation.Delete}
              transaction={transactions[selectedId]}
              closeHandler={this.closeTransactionModal}
              render={refundModal}
            />
          </>
        )}
      </>
    );
  }

  private updateStartDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    const newDate = value ? new Date(dateToTime(value)) : "";
    this.setState({ startDate: newDate },
      () => this.getTransactions(true));
  }
  private updateEndDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    const newDate = value ? new Date(dateToTime(value)) : "";
    this.setState({ endDate: newDate },
      () => this.getTransactions(true));
  }

  public render(): JSX.Element {
    const { transactions, totalItems, isReading, readError, admin, member } = this.props;

    const { selectedId, pageNum, order, orderBy, startDate, endDate } = this.state;
    const transactionList = Object.values(transactions);

    let error = readError;
    // Give better error if nothing loads for member
    if (!transactionList.length && !error && member && !member.customerId) {
      error = `No online payment history for ${member.firstname} ${member.lastname}.`
    }

    return (
      <Grid container spacing={24} justify="center">
        <Grid item xs={12}>
          {
            this.getActionButtons()
          }
        </Grid>
        <Grid item xs={12}>
          <span style={{ marginRight: "20px" }}>
            <TextField
              value={toDatePicker(startDate)}
              label="Start Date"
              name="start-date-filter"
              id="start-date-filter"
              type="date"
              onChange={this.updateStartDate}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </span>

          <span style={{ marginRight: "20px" }}>
            <TextField
              value={toDatePicker(endDate)}
              label="End Date"
              name="end-date-filter"
              id="end-date-filter"
              type="date"
              onChange={this.updateEndDate}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </span>

          {!member && <span style={{ width: "200px", display: "inline-block" }}>
            <AsyncSelectFixed
              isClearable
              name="member-filter"
              value={this.state.member}
              onChange={this.updateMemberValue}
              placeholder="Filter by Member"
              id="member-filter"
              loadOptions={this.memberOptions}
            />
          </span>}

        </Grid>
        <Grid item xs={12}>
          <TableContainer
            id="transactions-table"
            title={member ? "Payment History" : "Transactions"}
            loading={isReading}
            data={transactionList}
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
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const {
    entities: transactions,
    read: {
      totalItems,
      isRequesting: isReading,
      error: readError
    },
  } = state.transactions;

  const { currentUser: { isAdmin: admin } } = state.auth;
  return {
    transactions,
    totalItems,
    isReading,
    readError,
    admin,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps
): DispatchProps => {
  const { member } = ownProps;
  return {
    getTransactions: (admin, queryParams) => dispatch(
      readTransactionsAction(admin, {
        ...queryParams,
        ...member && {
            searchBy: TransactionSearchCriteria.Member,
            searchId: member.id,
         },
      })
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TransactionsList));