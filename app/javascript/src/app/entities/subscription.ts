export interface Subscription {
  id: string;
  plan_id: string;
  amount: number;
  status: string;
  failure_count: number;
  days_past_due: number;
  billing_day_of_month: number;
  first_billing_date: Date;
  next_billing_date: Date;
}