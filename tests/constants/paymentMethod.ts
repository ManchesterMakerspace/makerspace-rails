import { CreditCard, PaymentMethodType } from "app/entities/paymentMethod";

export const creditCard: CreditCard = {
  id: "foo",
  customerId: "foobar",
  paymentType: PaymentMethodType.CreditCard,
  last4: "1111",
  expirationMonth: "02",
  expirationYear: "2022",
  cardType: "Visa",
  debit: false,
  imageUrl: "",
  default: false,
}

export const creditCardForm = {
  cardNumber: "4111 1111 1111 1111",
  expiration: "02/2022",
  postalCode: "90210",
  csv: "123",
}