
export namespace Url {
  const baseApiPath = "api";
  export const Members = `${baseApiPath}/members`;
  export const SignIn = `${Members}/sign_in`;
  export const SignOut = `${Members}/sign_out`;

  export const baseBillingPath = `${baseApiPath}/billing`;
  export const BillingPlans = `${baseBillingPath}/plans`;

  export const Rentals = `${baseApiPath}/rentals`; 
}

export enum ApiErrorStatus {
  InternalServerError = "Internal Server Error",
  Unauthorized = "Unauthorized",
  NotFound = "Not Found",
  Forbidden = "Forbidden"
}

export const ApiErrorMessageMap = {
  [ApiErrorStatus.InternalServerError]: "Server Error. Please try again or contact an administrator.",
  [ApiErrorStatus.Unauthorized]: "Not Authorized.  Please sign in.",
  [ApiErrorStatus.Forbidden]: "Not Authorized.  Contact an admin for access.",
  [ApiErrorStatus.NotFound]: "Resource not found.",
}