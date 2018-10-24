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

  public invoiceForm = {
    id: "#invoice-form",
    description: "#invoice-form-description",
    notes: "#invoice-form-notes",
    contact: "#invoice-form-contact",
    dueDate: "#invoice-form-due-date",
    amount: "#invoice-form-amount",

    resource: "#invoice-form-resource",
    term: "#invoice-form-term",
    submit: "#invoice-form-submit",
    cancel: "#invoice-form-cancel",
    error: "#invoice-form-error",
    loading: "#invoice-form-loading",
  }

  public settleInvoiceModal = {
    id: "#settle-invoice-confirm",
    contact: "#settle-invoice-contact",
    amount: "#settle-invoice-amount",
    dueDate: "#settle-invoice-due-date",
  }

  public deleteInvoiceModal = {
    id: "#delete-invoice-confirm",
    contact: "#delete-invoice-contact",
    amount: "#delete-invoice-amount",
    dueDate: "#delete-invoice-due-date",
  }

  public paymentRequiredForm = {
    id: "#payment-required-modal",
    invoiceList: {
      id: "#payment-invoices-table",
      headers: {
        description: "#payment-invoices-table-description-header",
        dueDate: "#payment-invoices-table-dueDate-header",
        amount: "#payment-invoices-table-amount-header",
      },
      row: {
        id: "#payment-invoices-table-{ID}",
        select: "#payment-invoices-table-{ID}-select",
        description: "#payment-invoices-table-{ID}-description",
        dueDate: "#payment-invoices-table-{ID}-dueDate",
        amount: "#payment-invoices-table-{ID}-amount",
      },
      error: "#payment-invoices-table-error-row",
      noData: "#payment-invoices-table-no-data-row",
      loading: "#payment-invoices-table-loading",
    },
    submit: "#payment-required-modal-submit",
    cancel: "#payment-required-modal-cancel",
  }
}
export default new InvoicePageObject(invoicesTableId);
