import { RequestStatus, CollectionOf } from "app/interfaces";
import { EarnedMembership } from "app/entities/earnedMembership";

export interface EarnedMembershipsState {
  entities: CollectionOf<EarnedMembership>;
  read: RequestStatus & {
    totalItems: number;
  };
  update: RequestStatus;
  delete: RequestStatus;
  create: RequestStatus;
}