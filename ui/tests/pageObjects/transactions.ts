import { expect } from "chai";
import { Member, Transaction } from "makerspace-ts-api-client";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { Routing } from "app/constants";
import { timeToDate } from "ui/utils/timeToDate";
import { TablePageObject } from "./table";

const tableId = "transactions-table";
const transactionsListFields = ["createdAt", "description", "amount", "status"];

class TransactionsPageObject extends TablePageObject {
  public listUrl = Routing.Billing

  public fieldEvaluator = (member?: Partial<Member>) => (transaction: Partial<Transaction>) => (fieldContent: { field: string, text: string }) => {
    const { field, text } = fieldContent;
    if (field === "createdAt") {
      expect(text).to.eql(timeToDate(transaction.createdAt));
    } else if (field === "status") {
      expect(
        ["Successful", "Failed", "In Progress", "Unknown"].some((status => new RegExp(status, 'i').test(text)))
      ).to.be.true;
    } else if (field === "member") {
      if (member) {
        expect(text).to.eql(`${member.firstname} ${member.lastname}`);
      } else {
        expect(!!text).to.be.true;
      }
    } else if (field === "amount") {
      expect(numberAsCurrency(transaction[field])).to.eql(text);
    } else if (field === "description") {
      expect(["Refund", "Subscription Payment", "Standard Payment"].some((status => new RegExp(status, 'i').test(text)))
    ).to.be.true;
    } else {
      const contained = text.includes(transaction[field]);
      if (!contained) {
        console.error(field, `${text} != ${transaction[field]}`);
      }
      expect(contained).to.be.true;
    }
  }

  public actionButtons = {
    delete: "#transactions-list-delete",
  }

  private refundTransactionModalId = "#refund-transaction";
  public refundTransactionModal: { [key: string]: string } = {
    id: `${this.refundTransactionModalId}`,
    date: `${this.refundTransactionModalId}-date`,
    amount: `${this.refundTransactionModalId}-amount`,
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