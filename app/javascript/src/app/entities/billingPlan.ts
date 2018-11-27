export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  billingFrequency: number;
  amount: string;
}

export enum Properties {
  Id = "id",
  Name = "name",
  Description = "description",
  BillingFrequency = "billingFrequency",
  Amount = "amount",
}