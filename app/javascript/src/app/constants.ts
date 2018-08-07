
export namespace Url {
  const baseApiPath = "api";
  export const Members = `${baseApiPath}/members`;
  export const SignIn = `${Members}/sign_in`;
  export const SignOut = `${Members}/sign_out`;

  export const baseBillingPath = `${baseApiPath}/billing`;
  export const BillingPlans = `${baseBillingPath}/plans`;

  export const Rentals = `${baseApiPath}/rentals`; 
}
