import { RenewalEntity } from "ui/common/RenewalForm";
import { Properties, MemberDetails, MemberRole } from "app/entities/member";
import { timeToDate } from "ui/utils/timeToDate";
import { Routing } from "app/constants";
import { isObject } from "util";

export const memberToRenewal = (member: Partial<MemberDetails>): RenewalEntity => {
  return {
    id: member[Properties.Id],
    name: `${member[Properties.Firstname]} ${member[Properties.Lastname]}`,
    expiration: member[Properties.Expiration],
  }
}

export const memberIsAdmin = (member: Partial<MemberDetails>): boolean => {
  return member && member.role &&  member.role.includes(MemberRole.Admin);
}

export const displayMemberExpiration = (member: Partial<MemberDetails> | number) => {
  const expirationTime = isObject(member) ? (member as MemberDetails).expirationTime : member as number;
  return expirationTime ? timeToDate(expirationTime) : "N/A";
}

export const buildProfileRouting = (memberId: string) => {
  return Routing.Profile.replace(Routing.PathPlaceholder.MemberId, memberId);
};
