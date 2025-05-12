import { emailValid } from "app/utils";
import isString from "lodash-es/isString";

export enum Action {
  StartAuthRequest = "AUTH/START_REQUEST",
  AuthUserSuccess = "AUTH/LOGIN_SUCCESS",
  AuthUserFailure = "AUTH/LOGIN_FAILURE",
  LogoutSuccess = "AUTH/LOGOUT",
}

export const EmailExistsError = "Email is already taken";

export interface FormField {
  label?: string;
  name: string;
  placeholder?: string;
  validate?: (val: any) => string;
  transform?: (val: any) => any;
  error?: string;
  render?: (value: string | number | object) => string | JSX.Element;
  [key: string]: any;
}

export interface FormFields {
  [key: string]: FormField
}


export const loginPrefix = "login-modal";
export const LoginFields: FormFields = {
  email: {
    label: "Email",
    name: `${loginPrefix}-email`,
    placeholder: "Enter email",
    validate: (val: string) => !emailValid(val) && "Invalid email" || "",
    error: "Invalid email"
  },
  password: {
    label: "Password",
    name: `${loginPrefix}-password`,
    placeholder: "Enter Password",
    validate: (val) => !val && "Invalid password" || "",
    error: "Invalid password"
  }
}

export const signUpPrefix = "sign-up-form";
export const SignUpFields: FormFields = {
  firstname: {
    label: "First Name",
    name: `${signUpPrefix}-firstname`,
    placeholder: "Enter first name",
    error: "Invalid first name",
  },
  lastname: {
    label: "Last Name",
    name: `${signUpPrefix}-lastname`,
    placeholder: "Enter last name",
    error: "Invalid last name"
  },
  email: {
    label: "Email",
    name: `${signUpPrefix}-email`,
    placeholder: "Enter email",
  },
  password: {
    label: "Password",
    name: `${signUpPrefix}-password`,
    placeholder: "Enter password",
    validate: (val) => !(isString(val) && val.length > 7) && "Password must be 8 characters minimum",
  },
  membershipSelectionId: {
    label: "Membership Option",
    name: `${signUpPrefix}-membership-id`,
    placeholder: "Select a Membership Option",
    error: "Please select a membership option",
  },
  discount: {
    label: "Apply 10% Student, Senior and Military discount (ID required at orientation)",
    name: `${signUpPrefix}-discount`,
  },
  phone: {
    label: "Phone Number",
    name: `${signUpPrefix}-phone`,
  },
  street: {
    label: "Street Address",
    name: `${signUpPrefix}-street`,
    placeholder: "Enter street address",
    error: "Required"
  },
  unit: {
    label: "Unit or Apt #",
    name: `${signUpPrefix}-unit`,
  },
  city: {
    label: "City",
    name: `${signUpPrefix}-city`,
    placeholder: "Enter city",
    error: "Required"
  },
  state: {
    label: "State",
    name: `${signUpPrefix}-state`,
    placeholder: "Select a state",
    error: "Required"
  },
  postalCode: {
    label: "Postal Code",
    name: `${signUpPrefix}-postalCode`,
    placeholder: "Postal Code",
    error: "Required"
  },
}