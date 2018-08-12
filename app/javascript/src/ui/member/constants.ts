import { emailValid } from "app/utils";
import { FormFields } from "ui/common/FormModal";
import { TextField } from "@material-ui/core";

export enum Action {
  StartReadRequest = "MEMBER/START_READ_REQUEST",
  GetMemberSuccess = "MEMBER/GET_MEMBER_SUCCESS",
  GetMemberFailure = "MEMBER/GET_MEMBER_FAILURE",
  StartUpdateRequest = "MEMBER/START_UPDATE_REQUEST",
  UpdateMemberSuccess = "MEMBER/UPDATE_MEMBER_SUCCESS",
  UpdateMemberFailure = "MEMBER/UPDATE_MEMBER_FAILURE",
}

const formPrevix = "member-form";
export const fields: FormFields = {
  firstname: {
    label: "First Name",
    name: `${formPrevix}-firstname`,
    placeholder: "Enter first name",
    validate: (val) => !!val,
    error: "Invalid name",
  },
  lastname: {
    label: "Last Name",
    name: `${formPrevix}-lastname`,
    placeholder: "Enter last name",
    validate: (val) => !!val,
    error: "Invalid name"
  },
  email: {
    label: "Email",
    name: `${formPrevix}-email`,
    placeholder: "Enter email",
    validate: (val) => val && emailValid(val),
    error: "Invalid email"
  },
  status: {
    label: "Status",
    name: `${formPrevix}-status`,
    placeholder: "Select one",
    validate: (val) => !!val,
    error: "Invalid status"
  },
  expiration: {
    label: "Expiration Date",
    name: `${formPrevix}-expiration`,
    placeholder: "Membership Expiration",
    validate: (val) => !!val,
    error: "Invalid expiration"
  },
  role: {
    label: "Role",
    name: `${formPrevix}-role`,
    placeholder: "Select one",
    validate: (val) => !!val,
    error: "Invalid role"
  },
}