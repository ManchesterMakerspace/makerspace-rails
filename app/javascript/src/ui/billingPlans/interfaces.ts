import { RequestStatus, CollectionOf } from "app/interfaces";
import { BillingPlan } from "app/entities/billingPlan";

export interface PlansState {
  entities: CollectionOf<BillingPlan>;
  read: RequestStatus & {
    totalItems: number;
  };
}