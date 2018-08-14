import { emailValid } from "app/utils";
import isString from "lodash-es/isString";
import { FormFields } from "ui/common/Form";

export enum Action {
  StartAuthRequest = "AUTH/START_REQUEST",
  AuthUserSuccess = "AUTH/LOGIN_SUCCESS",
  AuthUserFailure = "AUTH/LOGIN_FAILURE",
  LogoutSuccess = "AUTH/LOGOUT",

  StageSignUp = "AUTH/STAGE_SIGN_UP",
  ClearStagedSignUp = "AUTH/CLEAR_STAGED_SIGN_UP",
}

const formPrefix = "auth-modal";
export const LoginFields: FormFields = {
  email: {
    label: "Email",
    name: `${formPrefix}-email`,
    placeholder: "Enter email",
    error: "Invalid email",
    validate: (val) => emailValid(val)
  },
  password: {
    label: "Password",
    name: `${formPrefix}-password`,
    placeholder: "Enter Password",
    error: "Invalid password",
    validate: (val) => !!val
  }
}

export const SignUpFields: FormFields = {
  firstname: {
    label: "First Name",
    name: `${formPrefix}-firstname`,
    placeholder: "Enter first name",
    validate: (val) => !!val,
    error: "Invalid first name",
  },
  lastname: {
    label: "Last Name",
    name: `${formPrefix}-lastname`,
    placeholder: "Enter last name",
    validate: (val) => !!val,
    error: "Invalid last name"
  },
  email: {
    label: "Email",
    name: `${formPrefix}-email`,
    placeholder: "Enter email",
    validate: (val) => val && emailValid(val),
    error: "Invalid email"
  },
  password: {
    label: "Password",
    name: `${formPrefix}-password`,
    placeholder: "Enter password",
    validate: (val) => isString(val) && val.length > 7,
    error: "Password must be 8 characters minimum"
  },
}