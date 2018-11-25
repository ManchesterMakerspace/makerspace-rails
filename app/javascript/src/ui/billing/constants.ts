export enum Action {
  StartReadRequest = "BILLING/START_READ_REQUEST",
  GetOptionsSuccess = "BILLING/GET_OPTIONS_SUCCESS",
  GetOptionsFailure = "BILLING/GET_OPTIONS_FAILURE",

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

export const fields = {

}