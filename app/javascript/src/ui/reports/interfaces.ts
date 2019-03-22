import { RequestStatus, CollectionOf } from "app/interfaces";
import { Report } from "app/entities/earnedMembership";

export interface ReportsState {
  entities: CollectionOf<Report>;
  read: RequestStatus & {
    totalItems: number;
  };
  create: RequestStatus;
}