import { RenewalEntity } from "ui/common/RenewalForm";
import { Properties, MemberDetails } from "app/entities/member";

export const memberToRenewal = (member: MemberDetails): RenewalEntity => {
  return {
    id: member[Properties.Id],
    name: `${member[Properties.Firstname]} ${member[Properties.Lastname]}`,
    expiration: member[Properties.Expiration],
  }
}