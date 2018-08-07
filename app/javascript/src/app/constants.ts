
export namespace Url {
  const baseApiPath = "api";
  export const membersPath = `${baseApiPath}/members`;
  export const signInPath = `${membersPath}/sign_in`;
  export const signOutPath = `${membersPath}/sign_out`;

  export const billingPath = `${baseApiPath}/payment`;
  export const plansPath = `${billingPath}/plans`;
}
