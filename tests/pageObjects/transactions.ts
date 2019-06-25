import { TablePageObject } from "./table";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { Routing } from "app/constants";
import { Transaction } from "app/entities/transaction";
import { MemberDetails } from "app/entities/member";
import { timeToDate } from "ui/utils/timeToDate";

const tableId = "transactions-table";
const transactionsListFields = ["createdAt", "description", "amount", "status"];

class TransactionsPageObject extends TablePageObject {
  public listUrl = Routing.Billing

  public fieldEvaluator = (member?: Partial<MemberDetails>) => (transaction: Partial<Transaction>) => (fieldContent: { field: string, text: string }) => {
    const { field, text } = fieldContent;
    if (field === "createdAt") {
      expect(text).toEqual(timeToDate(transaction.createdAt));
    } else if (field === "status") {
      expect(
        ["Paid", "Failed", "In Progress", "Unknown"].some((status => new RegExp(status, 'i').test(text)))
      ).toBeTruthy();
    } else if (field === "member") {
      if (member) {
        expect(text).toEqual(`${member.firstname} ${member.lastname}`);
      } else {
        expect(text).toBeTruthy();
      }
    } else if (field === "amount") {
      expect(numberAsCurrency(transaction[field])).toEqual(text);
    } else if (field === "description") {
      expect(["Refund", "Subscription Payment", "Standard Payment"].some((status => new RegExp(status, 'i').test(text)))
    ).toBeTruthy();
    } else {
      const contained = text.includes(transaction[field]);
      if (!contained) {
        console.error(field, `${text} != ${transaction[field]}`);
      }
      expect(contained).toBeTruthy();
    }
  }

  public actionButtons = {
    delete: "#transactions-list-delete",
  }

  private refundTransactionModalId = "#refund-transaction";
  public refundTransactionModal: { [key: string]: string } = {
    id: `${this.refundTransactionModalId}`,
    date: `${this.refundTransactionModalId}-date`,
    amount: `${this.refundTransactionModal}-amount`,
    description: `${this.refundTransactionModalId}-description`,
    member: `${this.refundTransactionModalId}-member`,
    submit: `${this.refundTransactionModalId}-submit`,
    cancel: `${this.refundTransactionModalId}-cancel`,
    error: `${this.refundTransactionModalId}-error`,
    loading: `${this.refundTransactionModalId}-loading`,
  }

  public filters = {
    startDate: "start-date-filter",
    endDate: "end-date-filter",
    member: "member-filter"
  }
  public transactionsList = {
    createButton: "#transactions-list-create",
    editButton: "#transactions-list-edit",
    renewButton: "#transactions-list-renew",
    deleteButton: "#transactions-list-delete",
  }
}

export default new TransactionsPageObject(tableId, transactionsListFields);