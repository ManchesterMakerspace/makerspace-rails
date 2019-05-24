import { TablePageObject } from "./table";
import { Routing } from "app/constants";
import { Transaction } from "app/entities/transaction";
import { MemberDetails } from "app/entities/member";
import { timeToDate } from "ui/utils/timeToDate";

const tableId = "transactions-table";
const transactionsListFields = ["createdAt", "description", "member", "amount", "status"];

class TransactionsPageObject extends TablePageObject {
  public listUrl = Routing.Rentals

  public fieldEvaluator = (member?: Partial<MemberDetails>) => (transaction: Partial<Transaction>) => (fieldContent: { field: string, text: string }) => {
    const { field, text } = fieldContent;
    if (field === "createdAt") {
      expect(text).toEqual(timeToDate(transaction.expiration));
    } else if (field === "status") {
      expect(
        ["Active", "Expired"].some((status => new RegExp(status, 'i').test(text)))
      ).toBeTruthy();
    } else if (field === "member") {
      if (member) {
        expect(text).toEqual(`${member.firstname} ${member.lastname}`);
      } else {
        expect(text).toBeTruthy();
      }
    } else {
      expect(text.includes(transaction[field])).toBeTruthy();
    }
  }

  public actionButtons = {
    delete: "#transactions-list-delete",
  }

  private refundTransactionModalId = "#refund-transaction";
  public refundTransactionModal = {
    id: `${this.refundTransactionModalId}`,
    number: `${this.refundTransactionModalId}-date`,
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