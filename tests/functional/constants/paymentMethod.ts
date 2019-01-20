import { CreditCard } from "app/entities/paymentMethod";

export const creditCard: CreditCard = {
  id: "foo",
  customerId: "foobar",
  paymentType: "credit_card",
  last4: "1111",
  expirationMonth: "02",
  expirationYear: "2022",
  cardType: "Visa",
}

export const creditCardForm = {
  cardNumber: "4111 1111 1111 1111",
  expiration: "02/2022",
  postalCode: "90210",
  csv: "123",
}