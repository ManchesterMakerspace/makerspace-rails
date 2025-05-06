import * as React from "react";
import moment from "moment";
import { Link } from 'react-router-dom';
import Grid from "@material-ui/core/Grid";

import { SortDirection } from "ui/common/table/constants";
import { Column } from "ui/common/table/Table";
import { timeToDate, dateToMidnight } from "ui/utils/timeToDate";
import RefundTransactionModal from "ui/transactions/RefundTransactionModal";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { renderTransactionStatus, getTransactionDescription, writeReport } from "ui/transactions/utils";
import { Member, Transaction, adminListTransaction, listTransactions } from "makerspace-ts-api-client";
import { useAuthState } from "../reducer/hooks";
import { useQueryContext, withQueryContext } from "../common/Filters/QueryContext";
import useReadTransaction from "../hooks/useReadTransaction";
import StatefulTable from "../common/table/StatefulTable";
import extractTotalItems from "../utils/extractTotalItems";
import TransactionsFilter from "./TransactionsFilter";
import ViewTransactionModal from "./ViewTransactionModal";
import { useSearchQuery } from "hooks/useSearchQuery";
import { ActionButton } from "ui/common/ButtonRow";

const getFields = (includeMember: boolean): Column<Transaction>[] => [
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
    cell: getTransactionDescription,
  },
  ...includeMember ? []: [{
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
  },
  {
    id: "view",
    label: "",
    cell: (row: Transaction) =>  <ViewTransactionModal transaction={row} />
  }
];

const rowId = (sub: Transaction) => sub.id;

const discountIdParam = "discountId";
const transactionStatusParam = "transactionStatus";

const TransactionsTable: React.FC<{ member?: Member }> = ({ member }) => {
  const [selectedId, setSelectedId] = React.useState<string>();

  const { initialDiscountId, initialStatus } = useSearchQuery({ 
    initialDiscountId: discountIdParam,
    initialStatus: transactionStatusParam
  })

  const { currentUser: { isAdmin } } = useAuthState();
  const {
    params: { pageNum, order, orderBy, ...restParams },
    changePage
  } = useQueryContext({
    startDate: dateToMidnight(moment().subtract(2, "months").valueOf()),
    endDate: dateToMidnight(new Date()),
    type: undefined,
    refund: undefined,
    transactionStatus: initialStatus ? 
      (Array.isArray(initialStatus) ? initialStatus : [initialStatus]) : [],
    discountId: initialDiscountId ? [initialDiscountId] : []
  });

  const adminResponse = useReadTransaction(
    adminListTransaction,
    {
      ...restParams,
      ...member && member.customerId && { customerId: member.customerId }
    },
    !isAdmin
  );

  const baseResponse = useReadTransaction(
    listTransactions,
    { ...restParams },
    isAdmin
  );

  const { isRequesting, data: transactions = [], response, refresh, error } = isAdmin ? adminResponse : baseResponse;

  const onCancel = React.useCallback(() => {
    refresh();
    changePage(0);
  }, [refresh, changePage]);

  const selectedTransaction = transactions.find(transaction => transaction.id === selectedId);

  return (
    <Grid container spacing={3} justify="center">
      <Grid item xs={12}>
        <Grid>
          <RefundTransactionModal
            transaction={selectedTransaction}
            onSuccess={onCancel}
          />
          <TransactionsFilter onChange={refresh}/>
        </Grid>

        <ActionButton
          id="transactions-table-download"
          style={{ float: "right" }}
          variant="contained"
          color="primary"
          disabled={isRequesting || !!error}
          onClick={() => writeReport(Object.values(transactions), "Transactions")}
          label="Download table"
        />

        <StatefulTable
          id="transactions-table"
          title={member ? "Payment History" : "Transactions"}
          loading={isRequesting}
          data={Object.values(transactions)}
          error={error}
          totalItems={extractTotalItems(response)}
          selectedIds={selectedId}
          setSelectedIds={setSelectedId}
          columns={getFields(!!member)}
          rowId={rowId}
        />
      </Grid>
    </Grid>
  )
}

export default withQueryContext(TransactionsTable);
