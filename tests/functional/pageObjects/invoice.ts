import { TablePageObject } from "./table";
import { timeToDate } from "ui/utils/timeToDate";
import { MemberDetails } from "app/entities/member";
import { Invoice } from "app/entities/invoice";

const invoicesTableId = "invoices-table";
const fields = [
  "contact", "dueDate", "amount", "settled", "status"
];
export class InvoicePageObject extends TablePageObject {
  public fieldEvaluator = (member?: Partial<MemberDetails>) => (invoice: Partial<Invoice>) => (fieldContent: { field: string, text: string }) => {
    const { field, text } = fieldContent;
     if (field === "member") {
      if (member) {
        expect(text).toEqual(`${member.firstname} ${member.lastname}`);
      } else {
        expect(text).toBeTruthy();
      }
    } else {
      expect(text.includes(invoice[field])).toBeTruthy();
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

    resource: `${this.invoiceFormId}-resource`,
    term: `${this.invoiceFormId}-term`,
    submit: `${this.invoiceFormId}-submit`,
    cancel: `${this.invoiceFormId}-cancel`,
    error: `${this.invoiceFormId}-error`,
    loading: `${this.invoiceFormId}-loading`,
  }

  private settleInvoiceFormId = "#settle-invoice";
  public settleInvoiceModal = {
    id: `${this.settleInvoiceFormId}-confirm`,
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
    id: `${this.deleteInvoiceModalId}-confirm`,
    contact: `${this.deleteInvoiceModalId}-contact`,
    amount: `${this.deleteInvoiceModalId}-amount`,
    dueDate: `${this.deleteInvoiceModalId}-due-date`,
    submit: `${this.deleteInvoiceModalId}-submit`,
    cancel: `${this.deleteInvoiceModalId}-cancel`,
    error: `${this.deleteInvoiceModalId}-error`,
    loading: `${this.deleteInvoiceModalId}-loading`,
  }
}
export default new InvoicePageObject(invoicesTableId, fields);
