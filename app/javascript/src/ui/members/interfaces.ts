import { RequestStatus, CollectionOf } from "app/interfaces";
import { MemberDetails } from "ui/member/interfaces";

export interface MembersState {
  entities: CollectionOf<MemberDetails>;
  read: RequestStatus & {
    totalItems: number;
  };
}