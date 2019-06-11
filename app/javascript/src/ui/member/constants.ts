import { emailValid } from "app/utils";
import { FormFields } from "ui/common/Form";
import { MemberStatus, MemberRole, MemberDetails } from "app/entities/member";
import { dateToTime } from "ui/utils/timeToDate";

export enum Action {
  StartReadRequest = "MEMBER/START_READ_REQUEST",
  GetMemberSuccess = "MEMBER/GET_MEMBER_SUCCESS",
  GetMemberFailure = "MEMBER/GET_MEMBER_FAILURE",
  StartUpdateRequest = "MEMBER/START_UPDATE_REQUEST",
  UpdateMemberSuccess = "MEMBER/UPDATE_MEMBER_SUCCESS",
  UpdateMemberFailure = "MEMBER/UPDATE_MEMBER_FAILURE",
}

const formPrefix = "member-form";
export const fields = (admin: boolean, member?: Partial<MemberDetails>): FormFields => ({
  firstname: {
    label: "First Name",
    name: `${formPrefix}-firstname`,
    placeholder: "Enter first name",
    validate: (val) => !!val,
    error: "Invalid name",
  },
  lastname: {
    label: "Last Name",
    name: `${formPrefix}-lastname`,
    placeholder: "Enter last name",
    validate: (val) => !!val,
    error: "Invalid name"
  },
  email: {
    label: "Email / Username",
    name: `${formPrefix}-email`,
    placeholder: "Enter email",
    validate: (val: string) => val && emailValid(val),
    error: "Invalid email"
  },
  ...admin && {
    status: {
      label: "Status",
      name: `${formPrefix}-status`,
      placeholder: "Select one",
      validate: (val) => !!val,
      error: "Invalid status"
    },
    groupName: {
      label: "Group Name (optional)",
      name: `${formPrefix}-groupName`,
      placeholder: "Select one",
    },
    ...member && member.id && {
      expirationTime: {
        label: "Expiration Date",
        name: `${formPrefix}-expirationTime`,
        placeholder: "Membership Expiration",
        transform: (val) => dateToTime(val),
        error: "Invalid expiration"
      },
    },
    role: {
      label: "Role",
      name: `${formPrefix}-role`,
      placeholder: "Select one",
      validate: (val) => !!val,
      error: "Invalid role"
    },
    memberContractOnFile: {
      label: "Member Contract Signed?",
      name: `${formPrefix}-contract`,
      validate: (val) => member && member.id ? true : val, // Validate contract only on create.
      transform: (val) => !!val,
      error: "Member must sign contract"
    }
  },
})

export const MemberStatusOptions = {
  [MemberStatus.Active]: "Active",
  [MemberStatus.Revoked]: "Revoked",
  [MemberStatus.NonMember]: "Non-Member",
  [MemberStatus.Inactive]: "Inactive",
}

export const MemberRoleOptions = {
  [MemberRole.Member]: "Member",
  [MemberRole.Admin]: "Admin"
}