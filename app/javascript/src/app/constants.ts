
export namespace Url {
  export enum PathPlaceholder {
    MemberId = "{memberId}",
    RentalId = "{rentalId}",
    Email = "{email}"
  }

  const baseApiPath = "api";
  const baseAdminPath = `${baseApiPath}/admin`;
  const baseBillingPath = `${baseApiPath}/billing`;

  export const Members = `${baseApiPath}/members`;
  export const Member = `${Members}/${PathPlaceholder.MemberId}`

  export const Rentals = `${baseApiPath}/rentals`;

  export const Auth = {
    SignIn: `${Members}/sign_in`,
    SignOut: `${Members}/sign_out`,
    PasswordReset: `${Members}/password`,
    EmailCheck: `${Members}/check_email/${PathPlaceholder.Email}`,
    SignUp: `${Members}`
  }

  export const Admin = {
    Member: `${baseAdminPath}/${Member}`
  }

  export const Billing = {
    Plans: `${baseBillingPath}/plans`,
    Subscriptions: `${baseBillingPath}/subscriptions`,
    Checkout: `${baseBillingPath}/checkout`
  }

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