export enum Action {
  StartReadRequest = "INVOICES/START_READ_REQUEST",
  GetInvoiceSuccess = "INVOICES/GET_INVOICE_SUCCESS",
  GetInvoiceFailure = "INVOICES/GET_INVOICE_FAILURE",

  StartUpdateRequest = "INVOICES/START_UPDATE_REQUEST",
  UpdateInvoiceSuccess = "INVOICES/UPDATE_INVOICE_SUCCESS",
  UpdateInvoiceFailure = "INVOICES/UPDATE_INVOICES_FAILURE",
}

const formPrefix = "invoice-form";
export const fields = {
  description: {
    label: "Description",
    name: `${formPrefix}-description`,
    placeholder: "Enter description",
    validate: (_val: string) => true,
  },
  notes: {
    label: "Notes",
    name: `${formPrefix}-notes`,
    placeholder: "Enter notes",
    validate: (_val: string) => true,
  },
  contact: {
    label: "Contact Info",
    name: `${formPrefix}-contact`,
    placeholder: "Enter Member's email",
    validate: (val: string) => !!val,
  },
  due_date: {
    label: "Due Date",
    name: `${formPrefix}-due-date`,
    placeholder: "Select a due date",
    validate: (val: string) => !!val,
  },
  amount: {
    label: "Amount",
    name: `${formPrefix}-amount`,
    placeholder: "Enter amount",
    validate: (val: number) => (!!val && val > 0),
  }
}