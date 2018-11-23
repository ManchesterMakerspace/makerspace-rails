export enum Action {
  StartReadRequest = "INVOICES/START_READ_REQUEST",
  GetInvoicesSuccess = "INVOICES/GET_INVOICES_SUCCESS",
  GetInvoicesFailure = "INVOICES/GET_INVOICES_FAILURE",

  StartCreateRequest = "INVOICES/START_CREATE_REQUEST",
  CreateInvoiceSuccess = "INVOICES/CREATE_INVOICES_SUCCESS",
  CreateInvoiceFailure = "INVOICES/CREATE_INVOICES_FAILURE",

  UpdateInvoiceSuccess = "INVOICES/UPDATE_INVOICES_SUCCESS",
  DeleteInvoiceSuccess = "INVOICES/DELETE_INVOICES_SUCCESS",

  ClearInvoices = "INVOICES/CLEAR",
}