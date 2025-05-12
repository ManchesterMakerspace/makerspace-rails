import { PaymentMethodType } from "app/entities/paymentMethod";
import { CreditCard } from "makerspace-ts-api-client";
import { creditCardNumbers } from "./api_seed_data";

const expiry = new Date();
expiry.setFullYear(expiry.getFullYear() + 3);

export const creditCard: CreditCard = {
  id: "foo",
  customerId: "foobar",
  paymentType: PaymentMethodType.CreditCard,
  last4: 1111,
  expirationMonth: expiry.getMonth(),
  expirationYear: expiry.getFullYear(),
  expirationDate: `${expiry.getMonth()}/${expiry.getFullYear()}`,
  cardType: "Visa",
  imageUrl: "",
  isDefault: false,
  debit: false,
  subscriptions: []
}

const expiration = `12${expiry.getFullYear()}`; // December, 3yrs from test run
export const newVisa = {
  ...creditCard,
  expiration,
  number: creditCardNumbers.visa,
  csv: "123",
  postalCode: "90210",
  name: "Some Guy with Visa"
}

export const newMastercard = {
  expiration,
  number: creditCardNumbers.mastercard,
  csv: "123",
  postalCode: "90210",
  name: "Some Guy with MC"
}
