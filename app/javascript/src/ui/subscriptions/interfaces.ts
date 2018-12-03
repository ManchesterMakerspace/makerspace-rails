import { RequestStatus, CollectionOf } from "app/interfaces";
import { Subscription } from "app/entities/subscription";

export interface SubscriptionsState {
  entities: CollectionOf<Subscription>;
  read: RequestStatus & {
    totalItems: number;
  };
  delete: RequestStatus;
}