export interface Checkout {
  paymentMethodNonce: string;
  firstname: string,
  lastname: string,
  email: string,
  planId?: string;
}