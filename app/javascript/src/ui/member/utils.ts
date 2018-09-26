import { RenewalEntity } from "ui/common/RenewalForm";
import { Properties, MemberDetails, MemberRole } from "app/entities/member";

export const memberToRenewal = (member: MemberDetails): RenewalEntity => {
  return {
    id: member[Properties.Id],
    name: `${member[Properties.Firstname]} ${member[Properties.Lastname]}`,
    expiration: member[Properties.Expiration],
  }
}

export const memberIsAdmin = (member: Partial<MemberDetails>): boolean => {
  return member && member.role &&  member.role.includes(MemberRole.Admin);
}