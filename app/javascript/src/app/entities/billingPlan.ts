export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  billingFrequency: number;
  amount: string;
  discounts: Discount[];
}

export interface Discount {
  id: string;
  name: string;
  description: string;
  amount: string;
}

export enum Properties {
  Id = "id",
  Name = "name",
  Description = "description",
  BillingFrequency = "billingFrequency",
  Amount = "amount",
}