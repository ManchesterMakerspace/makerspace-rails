import { CreditCard, PayPalAccount } from "makerspace-ts-api-client";

export interface PaymentMethod {
  id: string;
  customerId: string;
  paymentType?: string;
  imageUrl: string;
  isDefault: boolean;
}

export const isCreditCard = (paymentMethod: any): paymentMethod is CreditCard => {
  return paymentMethod.paymentType === PaymentMethodType.CreditCard;
};

export const isPaypal = (paymentMethod: any): paymentMethod is CreditCard => {
  return paymentMethod.paymentType === PaymentMethodType.PayPal;
};

export enum PaymentMethodType {
  PayPal = "paypal",
  Cash = "cash",
  CreditCard = "credit_card",
}

export type AnyPaymentMethod = CreditCard | PayPalAccount;