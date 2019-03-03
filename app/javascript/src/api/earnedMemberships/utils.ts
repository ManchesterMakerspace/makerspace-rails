import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";

export const buildMembershipPath = (membershipId: string): string => {
  return Url.Admin.EarnedMembership.replace(Url.PathPlaceholder.MembershipId, membershipId);
}

export const buildMembershipUrl = (memberId: string): string => {
  return buildJsonUrl(buildMembershipPath(memberId));
}
