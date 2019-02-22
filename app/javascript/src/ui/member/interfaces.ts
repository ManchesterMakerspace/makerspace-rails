import { RequestStatus } from "app/interfaces";
import { MemberDetails } from "app/entities/member";

export interface MemberState {
  entity: MemberDetails;
  read: RequestStatus;
  update: RequestStatus;
}