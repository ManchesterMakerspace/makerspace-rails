import { CollectionOf } from "app/interfaces";

const formPrefix = "credit-card-form";

export enum EmittedBy {
  Number = "number",
  Cvv = "cvv",
  ExpirationDate = "expirationDate",
  ExpirationMonth = "expirationMonth",
  ExpirationYear = "expirationYear",
  PostalCode = "postalCode",
  CardholderName = "cardholderName",
}

export enum PaymentType {
  CreditCard = "CREDIT",
  PayPal = "PAYPAL",
  Existing = "EXISTING"
}

export const paymentMethodQueryParam = "token";
export const paymentTypeFieldName = "newPaymentMethodSelection";
export const selectedFieldName = "paymentMethodSelection";
export const paypalValidation = "paypalValidation";

export const validatePaymentMethods = (validateCC: () => CollectionOf<string>) => (values: CollectionOf<any>) => {
  switch (values[paymentTypeFieldName]) {
    case PaymentType.Existing:
      return !values[selectedFieldName] && { [selectedFieldName]: "Select or create a payment method to continue" };
    case PaymentType.PayPal:
      return { [paypalValidation]: "Link your PayPal account or select it from existing to continue" };
    case PaymentType.CreditCard:
      return validateCC();
  }
} 

export const handleSubmit = (setSearch: (
  queryParms: CollectionOf<string>) => void,
  submitCC: () => void,
) => ({ values }: CollectionOf<any>) => {
  const isCC = values[paymentTypeFieldName] === PaymentType.CreditCard;
  if (values[paymentTypeFieldName] === PaymentType.Existing) {
    setSearch({ [paymentMethodQueryParam]: values[selectedFieldName] });
    return true;
  }

  return !isCC || submitCC();
}

export const CreditCardFields = {
  [EmittedBy.CardholderName]: {
    label: "Cardholder Name",
    name: `${formPrefix}-name`,
    placeholder: "Old MacDonald"
  },
  [EmittedBy.Number]: {
    label: "Credit or debit card number",
    name: `${formPrefix}-cardNumber`,
    placeholder: "4111 1111 1111 1111",
    required: true
  },
  [EmittedBy.Cvv]: {
    label: "Security code",
    name: `${formPrefix}-csv`,
    placeholder: "123",
    required: true
  },
  [EmittedBy.ExpirationDate]: {
    label: "Expiration date",
    name: `${formPrefix}-expirationDate`,
    placeholder: "MM/YYYY",
    required: true
  },
  [EmittedBy.PostalCode]: {
    label: "Postal Code",
    name: `${formPrefix}-zipcode`,
    placeholder: "90210",
    required: true
  }
}

export const hostedFieldStyles = {
  'input': {
    color: '#282c37',
    'font-size': '16px',
    transition: 'color 0.1s',
    'line-height': '3'
  },
  // Style the text of an invalid input
  'input.invalid': {
    color: '#E53A40'
  },
  // placeholder styles need to be individually adjusted
  '::-webkit-input-placeholder': {
    color: 'rgba(0,0,0,0.6)'
  },
  ':-moz-placeholder': {
    color: 'rgba(0,0,0,0.6)'
  },
  '::-moz-placeholder': {
    color: 'rgba(0,0,0,0.6)'
  },
  ':-ms-input-placeholder': {
    color: 'rgba(0,0,0,0.6)'
  },
  // prevent IE 11 and Edge from
  // displaying the clear button
  // over the card brand icon
  'input::-ms-clear': {
    opacity: '0'
  }
};
