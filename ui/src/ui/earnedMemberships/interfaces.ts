import { RequestStatus, CollectionOf } from "app/interfaces";
import { EarnedMembership } from "makerspace-ts-api-client";

export interface EarnedMembershipsState {
  entities: CollectionOf<EarnedMembership>;
  read: RequestStatus & {
    totalItems: number;
  };
  update: RequestStatus;
  delete: RequestStatus;
  create: RequestStatus;
}