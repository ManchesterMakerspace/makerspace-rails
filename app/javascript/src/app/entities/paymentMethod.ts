export interface PaymentMethod {
  id: string;
  customerId: string;
  paymentType: PaymentMethodType;
  imageUrl: string;
  default: boolean;
}

export interface CreditCard extends PaymentMethod {
  cardType: string;
  expirationMonth?: string;
  expirationYear?: string;
  expirationDate?: string;
  last4: string;
  debit: boolean;
}

export interface Paypal extends PaymentMethod {
  email: string;
}

export const isCreditCard = (paymentMethod: PaymentMethod): paymentMethod is CreditCard => {
  return paymentMethod.paymentType === PaymentMethodType.CreditCard;
};

export const isPaypal = (paymentMethod: PaymentMethod): paymentMethod is CreditCard => {
  return paymentMethod.paymentType === PaymentMethodType.PayPal;
};

export enum PaymentMethodType {
  PayPal = "paypal",
  Cash = "cash",
  CreditCard = "credit_card",
}

export type AnyPaymentMethod = CreditCard | Paypal;