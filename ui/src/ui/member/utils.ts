import { MemberSummary, Member, MemberRole } from "makerspace-ts-api-client";
import { RenewalEntity } from "ui/common/RenewalForm";
import { Properties } from "app/entities/member";
import { timeToDate } from "ui/utils/timeToDate";
import { Routing } from "app/constants";
import { isObject } from "util";

export const memberToRenewal = (member: Member | MemberSummary): RenewalEntity => {
  return {
    id: member[Properties.Id],
    name: `${member[Properties.Firstname]} ${member[Properties.Lastname]}`,
    expiration: member[Properties.Expiration],
  }
}

export const memberIsAdmin = (member: Member | MemberSummary): boolean => {
  return member && member.role &&  member.role.includes(MemberRole.Admin);
}

export const displayMemberExpiration = (member: Member | MemberSummary | number) => {
  const expirationTime = isObject(member) ? (member as MemberSummary).expirationTime : member as number;
  return expirationTime ? timeToDate(expirationTime) : "N/A";
}

export const buildProfileRouting = (memberId: string) => {
  return Routing.Profile.replace(Routing.PathPlaceholder.MemberId, memberId);
};

export const buildNewMemberProfileRoute = (memberId: string) =>
  buildProfileRouting(memberId) + "?newMember=true";
