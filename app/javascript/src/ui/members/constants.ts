import { MemberStatus } from "app/entities/member";
import { SelectOption } from "ui/common/RenewalForm";

export enum Action {
  StartReadRequest = "MEMBERS/START_READ_REQUEST",
  GetMembersSuccess = "MEMBERS/GET_MEMBERS_SUCCESS",
  GetMembersFailure = "MEMBERS/GET_MEMBERS_FAILURE",
}

export const memberStatusLabelMap = {
  [MemberStatus.Active]: "Active",
  [MemberStatus.Revoked]: "Revoked",
  [MemberStatus.NonMember]: "Non-Member",
};

  export const membershipRenewalOptions: SelectOption[] = [
  {
    label: "None",
    value: undefined,
  },
  {
    label: "1 month",
    value: 1,
  },
  {
    label: "3 months",
    value: 3,
  },
  {
    label: "6 months",
    value: 6,
  },
  {
    label: "12 months",
    value: 12,
  },
];