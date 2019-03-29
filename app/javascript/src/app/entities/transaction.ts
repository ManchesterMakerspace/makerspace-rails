import { Discount } from "app/entities/billingPlan";
import { Invoice } from "app/entities/invoice";

export interface Transaction {
  id: string;
  createdAt: Date;
  status: string;
  amount: string;
  recurring: boolean;
  planId?: string;
  subscriptionId?: string;
  subscriptionDetails?: any;
  paypalDetails?: any
  creditCardDetails?: any;
  disputes: any[];
  discounts: Discount[];
  discountAmount: string;
  lineItems: any[];
  gatewayRejectionReason: string;
  customerDetails: any;
  invoice?: Invoice;
}