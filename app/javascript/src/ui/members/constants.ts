import { MemberStatus } from "app/entities/member";

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
