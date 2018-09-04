import { FormFields } from "ui/common/Form";

export enum Action {
  StartAsyncRequest = "CHECKOUT/START_ASYNC_REQUEST",
  GetClientTokenSuccess = "CHECKOUT/GET_CLIENT_TOKEN_SUCCESS",
  GetClientTokenFailure = "CHECKOUT/GET_CLIENT_TOKEN_FAILURE",

  PostCheckoutSuccess = "CHECKOUT/POST_CHECKOUT_SUCCESS",
  PostCheckoutFailure = "CHECKOUT/POST_CHECKOUT_FAILURE",
}

const formPrefix = "checkout-form";
export const CheckoutFields: FormFields = {
  cardNumber: {
    label: "Card Number",
    name: `${formPrefix}-cardNumber`,
    placeholder: "4111 1111 1111 1111",
    validate: (val) => !!val
  },
  csv: {
    label: "CSV",
    name: `${formPrefix}-csv`,
    placeholder: "123"
  },
  expirationDate: {
    label: "Expiration Date",
    name: `${formPrefix}-expirationDate`,
    placeholder: "MM/YYYY"
  },
  postalCode: {
    label: "Zipcode",
    name: `${formPrefix}-zipcode`,
    placeholder: "90210"
  }
}