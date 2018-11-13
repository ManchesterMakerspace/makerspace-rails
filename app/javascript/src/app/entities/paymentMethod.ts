export interface PaymentMethod {
  id: string;
  customerId: string;
  paymentType: string;
}

export interface CreditCard extends PaymentMethod {
  cardType: string;
  expirationMonth: string;
  expirationYear: string;
  last4: string;
}

export const isCreditCard = (paymentMethod: PaymentMethod): paymentMethod is CreditCard => {
  return (<CreditCard>paymentMethod).cardType !== undefined;
};