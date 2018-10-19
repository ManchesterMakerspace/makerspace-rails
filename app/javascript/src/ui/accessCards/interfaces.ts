import { RequestStatus, CollectionOf } from "app/interfaces";
import { AccessCard } from "app/entities/card";

export interface CardState {
  entities: CollectionOf<AccessCard>;
  read: RequestStatus;
  update: RequestStatus;
}