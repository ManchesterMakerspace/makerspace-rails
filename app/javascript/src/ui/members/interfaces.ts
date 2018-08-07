import { RequestStatus, CollectionOf } from "app/interfaces";
import { MemberDetails } from "app/entities/member";

export interface MembersState {
  entities: CollectionOf<MemberDetails>;
  read: RequestStatus & {
    totalItems: number;
  };
}