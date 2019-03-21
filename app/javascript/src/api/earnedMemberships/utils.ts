import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";

export const buildMembershipPath = (membershipId: string, admin: boolean): string => {
  return (admin ? Url.Admin.EarnedMembership : Url.EarnedMembership).replace(Url.PathPlaceholder.MembershipId, membershipId);
}

export const buildMembershipUrl = (membershipId: string, admin: boolean = false): string => {
  return buildJsonUrl(buildMembershipPath(membershipId, admin));
}


export const buildReportsPath = (membershipId: string, admin: boolean): string => {
  return (admin ? Url.Admin.EarnedMembershipNamespace.Reports : Url.EarnedMembershipNamespace.Reports).replace(Url.PathPlaceholder.MembershipId, membershipId);
}

export const buildReportsUrl = (membershipId: string, admin: boolean = false): string => {
  return buildJsonUrl(buildReportsPath(membershipId, admin));
}

