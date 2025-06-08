export namespace Routing {
  export enum PathPlaceholder {
    Optional = "?",
    MemberId = ":memberId",
    Resource = ":resource",
    ResourceId = ":resourceId",
    InvoiceId = ":invoiceId",
    Email = ":email",
  }

  export const Root = "/";
  export const Login = "/login";
  export const SignUp = "/signup";
  export const Members = "/members";
  export const Documents = `/agreements/${Routing.PathPlaceholder.Resource}/${Routing.PathPlaceholder.ResourceId}${Routing.PathPlaceholder.Optional}`;
  export const Profile = `${Members}/${PathPlaceholder.MemberId}`;

  export const Billing = "/billing";
  export const Subscriptions = "/subscriptions";
  export const Rentals = "/rentals";
  export const Checkout = "/checkout";
  export const Receipt = `${Checkout}/receipt/${PathPlaceholder.InvoiceId}`;
  export const PasswordReset = "/resetPassword";
  export const Settings = `${Profile}/settings`;
  export const SendRegistration = `/send-registration/${PathPlaceholder.Email}`
  export const EarnedMemberships = "/earned-memberships";
  export const Unsubscribe = `/unsubscribe/${PathPlaceholder.MemberId}`
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
