import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";

export const buildMembershipPath = (membershipId: string, admin: boolean): string => {
  return (admin ? Url.Admin.EarnedMembership : Url.EarnedMembership).replace(Url.PathPlaceholder.MembershipId, membershipId);
}

export const buildMembershipUrl = (memberId: string, admin: boolean = false): string => {
  return buildJsonUrl(buildMembershipPath(memberId, admin));
}
