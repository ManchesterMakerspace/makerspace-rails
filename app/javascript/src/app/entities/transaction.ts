import { Discount } from "app/entities/billingPlan";
import { Invoice } from "app/entities/invoice";

export interface Transaction {
  id: string;
  memberName: string;
  memberId: string;
  description: string;
  createdAt: Date;
  status: string;
  amount: string;
  recurring: boolean;
  discounts: Discount[];
  discountAmount: string;
  lineItems: any[];
  customerDetails: any;
  invoice?: Invoice;
  planId?: string;
  subscriptionId?: string;
  subscriptionDetails?: any;
  disputes?: any[];
  gatewayRejectionReason?: string;
  refundedTransactionId: string;
  paymentMethodDetails?: any;
}

export enum TransactionStatus {
  Settled = "settled",
  Failed = "failed",
  Declined = "processor_declined",
  Rejected = "gateway_rejected",
  Voided = "voided",
  Unknown = "unrecognized"
}