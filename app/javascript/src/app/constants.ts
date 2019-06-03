
export namespace Url {
  export enum PathPlaceholder {
    MemberId = "{memberId}",
    RentalId = "{rentalId}",
    Email = "{email}",
    CardId = "{cardId}",
    InvoiceId = "{invoiceId}",
    SubscriptionId = "{subscriptionId}",
    TransactionId = "{transactionId}",
    PaymentMethodId = "{paymentMethodId}",
    MembershipId = "{membershipId}",
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

  export const Permissions = `${baseApiPath}/permissions`;
  export const Permission = `${Permissions}/${PathPlaceholder.MemberId}`;

  export const Auth = {
    SignIn: `${Members}/sign_in`,
    SignOut: `${Members}/sign_out`,
    Password: `${Members}/password`,
    SignUp: `${Members}`,
    SendRegistration: `${baseApiPath}/send_registration`
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
      Transactions: `${baseAdminPath}/billing/transactions`,
      Transaction: `${baseAdminPath}/billing/transactions/${PathPlaceholder.TransactionId}`,
    },
    Permissions: `${baseAdminPath}/permissions`,
    Permission: `${baseAdminPath}/permissions/${PathPlaceholder.MemberId}`,

    EarnedMemberships: `${baseAdminPath}/earned_memberships`,
    EarnedMembership: `${baseAdminPath}/earned_memberships/${PathPlaceholder.MembershipId}`,
    EarnedMembershipNamespace: {
      Reports: `${baseAdminPath}/earned_memberships/${PathPlaceholder.MembershipId}/reports`
    }
  }

  export const Billing = {
    PaymentMethods: `${baseBillingPath}/payment_methods`,
    PaymentMethod: `${baseBillingPath}/payment_methods/${PathPlaceholder.PaymentMethodId}`,
    Plans: `${baseBillingPath}/plans`,
    Discounts: `${baseBillingPath}/plans/discounts`,
    Subscriptions: `${baseBillingPath}/subscriptions`,
    Subscription: `${baseBillingPath}/subscriptions/${PathPlaceholder.SubscriptionId}`,
    Transactions: `${baseBillingPath}/transactions`,
    Transaction: `${baseBillingPath}/billing/transactions/${PathPlaceholder.TransactionId}`,
  }

  export const EarnedMemberships = `${baseApiPath}/earned_memberships`
  export const EarnedMembership = `${EarnedMemberships}/${PathPlaceholder.MembershipId}`
  export const EarnedMembershipNamespace ={
    Reports: `${EarnedMembership}/reports`
  }
}

export namespace Routing {
  export enum PathPlaceholder {
    Optional = "?",
    MemberId = ":memberId",
    Resource = ":resource",
    Email = ":email",
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
  export const Receipt = `${Checkout}/receipt`;
  export const PasswordReset = "/resetPassword";
  export const Settings = "/settings";
  export const SendRegistration = `/send_registration/${PathPlaceholder.Email}`
  export const EarnedMemberships = "/earned_memberships";
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

export enum Whitelists {
  billing = "billing",
  customBilling = "custom_billing",
  earnedMembership = "earned_membership"
}

// TODO: I don't like this very much
export const billingEnabled = (process as any).env.BILLING_ENABLED || false;
