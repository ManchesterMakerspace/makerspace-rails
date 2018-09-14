export interface Subscription {
  id: string;
  plan_id: string;
  amount: number;
  status: string;
  failureCount: number;
  daysPastDue: number;
  billingDayOfMonth: number;
  firstBillingDate: Date;
  nextBillingDate: Date;
}