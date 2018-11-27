import { Properties, InvoiceableResource } from "app/entities/invoice"
export enum Action {
  StartReadRequest = "BILLING/START_READ_REQUEST",
  GetOptionsSuccess = "BILLING/GET_OPTIONS_SUCCESS",
  GetOptionsFailure = "BILLING/GET_OPTIONS_FAILURE",

  StartPlansRequest = "BILLING/START_PLANS_REQUEST",
  GetPlansSuccess = "BILLING/GET_PLANS_SUCCESS",
  GetPlansFailure = "BILLING/GET_PLANS_FAILURE",

  StartCreateRequest = "BILLING/START_CREATE_REQUEST",
  CreateOptionSuccess = "BILLING/CREATE_OPTION_SUCCESS",
  CreateOptionFailure = "BILLING/CREATE_OPTION_FAILURE",

  StartUpdateRequest = "BILLING/START_UPDATE_REQUEST",
  UpdateOptionSuccess = "BILLING/UPDATE_OPTION_SUCCESS",
  UpdateOptionFailure = "BILLING/UPDATE_OPTION_FAILURE",

  StartDeleteRequest = "BILLING/START_DELETE_REQUEST",
  DeleteOptionSuccess = "BILLING/DELETE_OPTION_SUCCESS",
  DeleteOptionFailure = "BILLING/DELETE_OPTION_FAILURE",
}

const formPrefix = "billing-form";
export const fields = {
  [Properties.ResourceClass]: {
    label: "Type",
    name: `${formPrefix}-type`,
    placeholder: "Enter Name",
    validate: (val: string) => Object.values(InvoiceableResource).includes(val),
    error: "Name required"
  },
  [Properties.Name]: {
    label: "Name",
    name: `${formPrefix}-name`,
    placeholder: "Enter Name",
    validate: (val: string) => !!val,
    error: "Name required"
  },
  [Properties.Description]: {
    label: "Description",
    name: `${formPrefix}-description`,
    placeholder: "Enter Description",
  },
  [Properties.Amount]: {
    label: "Amount ($)",
    name: `${formPrefix}-amount`,
    placeholder: "Enter amount",
    validate: (val: number) => (!!val && val > 0),
    error: "Amount required"
  },
  [Properties.Quantity]: {
    label: "Length (months)",
    name: `${formPrefix}-quantity`,
    placeholder: "Number of months to renew",
    validate: (val: string) => !!val,
    error: "Number of months to renew is required"
  },
  [Properties.PlanId]: {
    label: "Billing Plan (optional)",
    name: `${formPrefix}-billing-plan`,
    placeholder: "Select a billing plan",
  },
  [Properties.Operation]: {
    label: "Operation on completion",
    name: `${formPrefix}-operation`,
    validate: (_val: string) => true,
  }
}