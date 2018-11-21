import { emailValid } from "app/utils";
import { FormFields } from "ui/common/Form";

export enum Action {
  StartReadRequest = "MEMBER/START_READ_REQUEST",
  GetMemberSuccess = "MEMBER/GET_MEMBER_SUCCESS",
  GetMemberFailure = "MEMBER/GET_MEMBER_FAILURE",
  StartUpdateRequest = "MEMBER/START_UPDATE_REQUEST",
  UpdateMemberSuccess = "MEMBER/UPDATE_MEMBER_SUCCESS",
  UpdateMemberFailure = "MEMBER/UPDATE_MEMBER_FAILURE",
}

const formPrefix = "member-form";
export const fields: FormFields = {
  firstname: {
    label: "First Name",
    name: `${formPrefix}-firstname`,
    placeholder: "Enter first name",
    validate: (val) => !!val,
    error: "Invalid name",
  },
  lastname: {
    label: "Last Name",
    name: `${formPrefix}-lastname`,
    placeholder: "Enter last name",
    validate: (val) => !!val,
    error: "Invalid name"
  },
  email: {
    label: "Email",
    name: `${formPrefix}-email`,
    placeholder: "Enter email",
    validate: (val: string) => val && emailValid(val),
    error: "Invalid email"
  },
  // status: {
  //   label: "Status",
  //   name: `${formPrefix}-status`,
  //   placeholder: "Select one",
  //   validate: (val) => !!val,
  //   error: "Invalid status"
  // },
  expirationTime: {
    label: "Expiration Date",
    name: `${formPrefix}-expirationTime`,
    placeholder: "Membership Expiration",
    validate: (val) => !!val,
    // transform: (val) => new Date(val).getTime(),
    error: "Invalid expiration"
  },
  // role: {
  //   label: "Role",
  //   name: `${formPrefix}-role`,
  //   placeholder: "Select one",
  //   validate: (val) => !!val,
  //   error: "Invalid role"
  // },
}