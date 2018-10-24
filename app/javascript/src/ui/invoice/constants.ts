import { InvoiceableResource } from "app/entities/invoice";

export enum Action {
  StartReadRequest = "INVOICE/START_READ_REQUEST",
  GetInvoiceSuccess = "INVOICE/GET_INVOICE_SUCCESS",
  GetInvoiceFailure = "INVOICE/GET_INVOICE_FAILURE",

  StartUpdateRequest = "INVOICE/START_UPDATE_REQUEST",
  UpdateInvoiceSuccess = "INVOICE/UPDATE_INVOICE_SUCCESS",
  UpdateInvoiceFailure = "INVOICE/UPDATE_INVOICE_FAILURE",

  StartDeleteRequest = "INVOICE/START_DELETE_REQUEST",
  DeleteInvoiceSuccess = "INVOICE/DELETE_INVOICE_SUCCESS",
  DeleteInvoiceFailure = "INVOICE/DELETE_INVOICE_FAILURE",

  StageInvoice = "INVOICE/STAGE",
  ResetStagedInvoice = "INVOICE/RESET_STAGED",
}

const formPrefix = "invoice-form";
export const fields = {
  description: {
    label: "Description",
    name: `${formPrefix}-description`,
    placeholder: "Enter description",
    validate: (val: string) => !!val,
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
    error: "Contact info required"
  },
  dueDate: {
    label: "Due Date",
    name: `${formPrefix}-due-date`,
    placeholder: "Select a due date",
    validate: (val: string) => true,
    error: "Due date required"
  },
  amount: {
    label: "Amount",
    name: `${formPrefix}-amount`,
    placeholder: "Enter amount",
    validate: (val: number) => (!!val && val > 0),
    error: "Invoice amount required"
  },
  resource: {
    label: "Invoice For",
    name: `${formPrefix}-resource`,
    placeholder: "Select an item to invoice for",
    validate: (val: InvoiceableResource) => val && Object.values(InvoiceableResource).includes(val),
    error: "Invalid selection"
  },
  term: {
    label: "Renewal Length",
    name: `${formPrefix}-term`,
    placeholder: "Select a term to renew",
    validate: (val: string) => !!val,
    error: "Invalid selection"
  }
}