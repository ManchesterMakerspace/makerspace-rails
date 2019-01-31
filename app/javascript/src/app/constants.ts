
export namespace Url {
  export enum PathPlaceholder {
    MemberId = "{memberId}",
    RentalId = "{rentalId}",
    Email = "{email}",
    CardId = "{cardId}",
    InvoiceId = "{invoiceId}",
    SubscriptionId = "{subscriptionId}",
    PaymentMethodId = "{paymentMethodId}",
  }

  const baseApiPath = "api";
  const baseAdminPath = `${baseApiPath}/admin`;
  const baseBillingPath = `${baseApiPath}/billing`;

  export const Members = `${baseApiPath}/members`;
  export const Member = `${Members}/${PathPlaceholder.MemberId}`

  export const Rentals = `${baseApiPath}/rentals`;

  export const Groups = `${baseApiPath}/groups`;

  export const Invoices = `${baseApiPath}/invoices`;
  export const InvoiceOptions = `${baseApiPath}/invoice_options`;

  export const Auth = {
    SignIn: `${Members}/sign_in`,
    SignOut: `${Members}/sign_out`,
    Password: `${Members}/password`,
    SignUp: `${Members}`
  }

  export const Admin = {
    Members: `${baseAdminPath}/members`,
    Member: `${baseAdminPath}/members/${PathPlaceholder.MemberId}`,
    AccessCards: `${baseAdminPath}/cards`,
    AccessCard: `${baseAdminPath}/cards/${PathPlaceholder.CardId}`,
    Invoices: `${baseAdminPath}/invoices`,
    Invoice: `${baseAdminPath}/invoices/${PathPlaceholder.InvoiceId}`,
    InvoiceOptions: `${baseAdminPath}/invoice_options`,
    InvoiceOption: `${baseAdminPath}/invoice_options/${PathPlaceholder.InvoiceId}`,
    Rentals: `${baseAdminPath}/rentals`,
    Rental: `${baseAdminPath}/rentals/${PathPlaceholder.RentalId}`,
    Billing: {
      Subscriptions: `${baseAdminPath}/billing/subscriptions`,
      Subscription: `${baseAdminPath}/billing/subscriptions/${PathPlaceholder.SubscriptionId}`,
    }
  }

  export const Billing = {
    PaymentMethods: `${baseBillingPath}/payment_methods`,
    PaymentMethod: `${baseBillingPath}/payment_methods/${PathPlaceholder.PaymentMethodId}`,
    Plans: `${baseBillingPath}/plans`,
    Discounts: `${baseBillingPath}/plans/discounts`,
    Subscriptions: `${baseBillingPath}/subscriptions`,
    Subscription: `${baseBillingPath}/subscriptions/${PathPlaceholder.SubscriptionId}`,
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
  export const SignUp = "/signup";
  export const Members = "/members";
  export const Documents = "/agreements"
  export const Profile = `${Members}/${PathPlaceholder.MemberId}`;

  export const Billing = "/billing";
  export const Subscriptions = "/subscriptions";
  export const Rentals = "/rentals";
  export const Checkout = "/checkout";
  export const PasswordReset = "/resetPassword";
  export const Settings = "/settings";
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

export namespace Whitelists {
  export const billingEnabled = (process as any).env.BILLING_ENABLED || false;
}