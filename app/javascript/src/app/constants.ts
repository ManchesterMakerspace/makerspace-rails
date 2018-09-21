
export namespace Url {
  export enum PathPlaceholder {
    MemberId = "{memberId}",
    RentalId = "{rentalId}",
    Email = "{email}",
    CardId = "{cardId}",
    InvoiceId = "{invoiceId}",
  }

  const baseApiPath = "api";
  const baseAdminPath = `${baseApiPath}/admin`;
  const baseBillingPath = `${baseApiPath}/billing`;

  export const Members = `${baseApiPath}/members`;
  export const Member = `${Members}/${PathPlaceholder.MemberId}`

  export const Rentals = `${baseApiPath}/rentals`;

  export const Invoices = `${baseApiPath}/invoices`;
  export const InvoiceOptions = `${Invoices}/options`;

  export const Auth = {
    SignIn: `${Members}/sign_in`,
    SignOut: `${Members}/sign_out`,
    Password: `${Members}/password`,
    SignUp: `${Members}`
  }

  export const Admin = {
    Member: `${baseAdminPath}/members/${PathPlaceholder.MemberId}`,
    AccessCards: `${baseAdminPath}/cards`,
    AccessCard: `${baseAdminPath}/cards/${PathPlaceholder.CardId}`,
    Invoices: `${baseAdminPath}/invoices`,
    Invoice: `${baseAdminPath}/invoices/${PathPlaceholder.InvoiceId}`,
  }

  export const Billing = {
    Plans: `${baseBillingPath}/plans`,
    Subscriptions: `${baseBillingPath}/subscriptions`,
    Checkout: `${baseBillingPath}/checkout`
  }

}

export namespace Routing {
  export enum PathPlaceholder {
    Optional = "?",
    MemberId = ":memberId",
    Resource = ":resource",
  }

  export const Root = "/";
  export const Login = "/login";
  export const SignUp = "/signUp";
  export const Members = "/members";
  export const Profile = `${Members}/${PathPlaceholder.MemberId}`;

  export const Billing = "/billing";
  export const Subscriptions = "/subscriptions";
  export const Rentals = "/rentals";
  export const Checkout = "/checkout";
  export const PasswordReset = "/resetPassword";
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

export enum CrudOperation {
  Read = "read",
  Create = "create",
  Update = "update",
  Delete = "delete",
}