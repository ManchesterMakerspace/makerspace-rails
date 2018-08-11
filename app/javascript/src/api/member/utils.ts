import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";

export const buildMemberPath = (memberId: string, admin: boolean): string => {
  const path = admin ? Url.Admin.Member : Url.Member
  return path.replace(Url.PathPlaceholder.MemberId, memberId);
}

export const buildMemberUrl = (memberId: string, admin: boolean = false): string => {
  return buildJsonUrl(buildMemberPath(memberId, admin));
}