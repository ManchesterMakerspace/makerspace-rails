class PaymentMethods {
  public addPaymentButton = "#add-payment-button"
  public paymentMethodFormSelect = {
    creditCard: "#card-payment",
    paypal: "#paypal-button",
    error: "#braintree-payment-method-error",
    cancel: "#payment-method-cancel",
  }

  public paymentMethodSelect = {
    paymentMethodId: "#select-payment-method-{ID}",
    noneFound: "#none-found",
    error: "#get-payment-methods-error",
  }

  public getPaymentMethodSelectId = (id: string) =>
    this.paymentMethodSelect.paymentMethodId.replace("{ID}", id)

  public deletePaymentButton = "#delete-payment-button"
  private paymentMethodDeleteId = "#delete-payment-method-confirm"
  public paymentMethodDelete = {
    error: `${this.paymentMethodDeleteId}-error`,
    submit: `${this.paymentMethodDeleteId}-submit`,
    cancel: `${this.paymentMethodDeleteId}-cancel`,
  }
}
export const paymentMethods = new PaymentMethods();

class CreditCard {
  private creditCardFormId = "#credit-card-form"
  public creditCardForm = {
    cardNumber: `${this.creditCardFormId}-cardNumber`,
    csv: `${this.creditCardFormId}-csv`,
    expirationDate: `${this.creditCardFormId}-expirationDate`,
    postalCode: `${this.creditCardFormId}-postalCode`,
    submit: `${this.creditCardFormId}-submit`,
  }
}
export const creditCard = new CreditCard();

class Paypal {
  public error = "#paypal-error"
}
export const paypal = new Paypal();