export enum Action {
  StartAuthRequest = "AUTH/START_REQUEST",
  LoginUserSuccess = "AUTH/LOGIN_SUCCESS",
  LoginUserFailure = "AUTH/LOGIN_FAILURE",
  LogoutSuccess = "AUTH/LOGOUT",
}

const formPrefix = "auth-modal";
export const fields = {
  email: {
    label: "Email",
    name: `${formPrefix}-email`,
    placeholder: "Enter email"
  },
  password: {
    label: "Password",
    name: `${formPrefix}-password`,
    placeholder: "Enter Password"
  }
}