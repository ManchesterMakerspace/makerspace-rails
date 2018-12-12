import { TablePageObject } from "./table";

export const invoicesTableId = "invoices-table";
export class InvoicePageObject extends TablePageObject {
  public fields = [
    "contact", "dueDate", "amount", "settled", "status"
  ];

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

  private paymentRequiredTableId = "#payment-invoices-table";
  private paymentRequiredModalId = "#payment-invoices-modal";
  public paymentRequiredForm = {
    id: `${this.paymentRequiredModalId}`,
    invoiceList: {
      id: `${this.paymentRequiredTableId}`,
      headers: {
        description: `${this.paymentRequiredTableId}-description-header`,
        dueDate: `${this.paymentRequiredTableId}-dueDate-header`,
        amount: `${this.paymentRequiredTableId}-amount-header`,
      },
      row: {
        id: `${this.paymentRequiredTableId}-{ID}`,
        select: `${this.paymentRequiredTableId}-{ID}-select`,
        description: `${this.paymentRequiredTableId}-{ID}-description`,
        dueDate: `${this.paymentRequiredTableId}-{ID}-dueDate`,
        amount: `${this.paymentRequiredTableId}-{ID}-amount`,
      },
      error: `${this.paymentRequiredTableId}-error-row`,
      noData: `${this.paymentRequiredTableId}-no-data-row`,
      loading: `${this.paymentRequiredTableId}-loading`,
    },
    submit: `${this.paymentRequiredModalId}-submit`,
    cancel: `${this.paymentRequiredModalId}-cancel`,
  }
}
export default new InvoicePageObject(invoicesTableId);
