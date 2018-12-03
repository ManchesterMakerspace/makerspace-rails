export interface Subscription {
  id: string;
  planId: string;
  memberName: string;
  memberId: string;
  resourceClass: string;
  resourceId: string;
  amount: number;
  status: string;
  failureCount: number;
  daysPastDue: number;
  billingDayOfMonth: number;
  firstBillingDate: Date;
  nextBillingDate: Date;
}