import { expect } from "chai";
import { Member } from "makerspace-ts-api-client";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { timeToDate } from "ui/utils/timeToDate";
import { MemberInvoice, RentalInvoice } from "app/entities/invoice";
import { TablePageObject } from "./table";

const invoicesTableId = "invoices-table";
// Settled not included because that's only for admins
// TODO: Status not included because its complicated
const fields = [
  "resourceClass", "dueDate", "amount"
];
export class InvoicePageObject extends TablePageObject {
  public fieldEvaluator = (member?: Partial<Member>) => (invoice: Partial<MemberInvoice | RentalInvoice>) => (fieldContent: { field: string, text: string }) => {
    const { field, text } = fieldContent;
      if (field === "dueDate") {
        expect(text).to.eql(timeToDate(invoice.dueDate));
      } else if (field === "member") {
      if (member) {
        expect(text).to.eql(`${member.firstname} ${member.lastname}`);
      } else {
        expect(!!text).to.be.true;
      }
    } else if (field === "resourceClass") {
      expect(["Membership", "Rental"].some((status => new RegExp(status, 'i').test(text)))).to.be.true;
    } else if (field === "amount") {
      expect(numberAsCurrency(invoice[field])).to.eql(text);
    } else {
      const contained = text.includes(invoice[field]);
      if (!contained) {
        console.error(field, text);
      }
      expect(contained).to.be.true;
    }
  }

  public actionButtons = {
    create: "#invoices-list-create",
    edit: "#invoices-list-edit",
    delete: "#invoices-list-delete",
    payNow: "#invoices-list-payNow",
  }

  private invoiceFormId = "#invoice-form";
  public invoiceForm = {
    id: `${this.invoiceFormId}`,
    description: `${this.invoiceFormId}-description`,
    notes: `${this.invoiceFormId}-notes`,
    contact: `${this.invoiceFormId}-contact`,
    dueDate: `${this.invoiceFormId}-due-date`,
    amount: `${this.invoiceFormId}-amount`,
    invoiceOption: `${this.invoiceFormId}-option`,
    resourceClass: `${this.invoiceFormId}-type`,

    resource: `${this.invoiceFormId}-resource`,
    term: `${this.invoiceFormId}-term`,
    submit: `${this.invoiceFormId}-submit`,
    cancel: `${this.invoiceFormId}-cancel`,
    error: `${this.invoiceFormId}-error`,
    loading: `${this.invoiceFormId}-loading`,
  }

  private settleInvoiceFormId = "#settle-invoice";
  public settleInvoiceModal = {
    id: `${this.settleInvoiceFormId}`,
    contact: `${this.settleInvoiceFormId}-contact`,
    amount: `${this.settleInvoiceFormId}-amount`,
    dueDate: `${this.settleInvoiceFormId}-due-date`,
    submit: `${this.settleInvoiceFormId}-submit`,
    cancel: `${this.settleInvoiceFormId}-cancel`,
    error: `${this.settleInvoiceFormId}-error`,
    loading: `${this.settleInvoiceFormId}-loading`,
  }

  private deleteInvoiceModalId = "#delete-invoice";
  public deleteInvoiceModal = {
    id: `${this.deleteInvoiceModalId}`,
    member: `${this.deleteInvoiceModalId}-member`,
    description: `${this.deleteInvoiceModalId}-description`,
    amount: `${this.deleteInvoiceModalId}-amount`,
    dueDate: `${this.deleteInvoiceModalId}-due-date`,
    submit: `${this.deleteInvoiceModalId}-submit`,
    cancel: `${this.deleteInvoiceModalId}-cancel`,
    error: `${this.deleteInvoiceModalId}-error`,
    loading: `${this.deleteInvoiceModalId}-loading`,
  }
}
export default new InvoicePageObject(invoicesTableId, fields);
