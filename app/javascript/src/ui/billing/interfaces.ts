import { RequestStatus, CollectionOf } from "app/interfaces";
import { InvoiceOption } from "app/entities/invoice";
import { BillingPlan } from "app/entities/billingPlan";

export interface BillingState {
  entities: CollectionOf<InvoiceOption>;
  billingPlans: CollectionOf<BillingPlan>;
  read: RequestStatus & {
    totalItems: number;
  };
  create: RequestStatus;
  update: RequestStatus;
  delete: RequestStatus;
}