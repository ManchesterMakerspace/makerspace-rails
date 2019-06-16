import utils from "./common";
import { By } from "selenium-webdriver";

class PaymentMethods {
  public addPaymentButton = "#add-payment-button"
  public paymentMethodFormSelect = {
    creditCard: "#card-payment",
    paypal: "#paypal-button",
    error: "#braintree-payment-method-error",
    loading: "#payment-method-form-loading",
    cancel: "#payment-method-form-cancel",
  }

  public paymentMethodSelect = {
    loading: "#get-payment-methods",
    paymentMethodId: "#select-payment-method-{ID}",
    noneFound: "#none-found",
    error: "#get-payment-methods-error",
  }

  public getPaymentMethodSelectId = (id: string) =>
    this.paymentMethodSelect.paymentMethodId.replace("{ID}", id)

  public selectPaymentMethodByIndex = async (index: number) => {
    const paymentmethodElementss = await this.getPaymentMethods();
    await paymentmethodElementss[index].click();
  }

  public getPaymentMethods = () => browser.findElements(By.css(`[id^="select-payment-method-"]`));

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
    cardNumber: `#credit-card-number`,
    csv: `#csv`,
    expirationDate: `#expiration`,
    postalCode: `#postal-code`,
    submit: `${this.creditCardFormId}-submit`,
    loading: `${this.creditCardFormId}-loading`,
  }
}

export const creditCard = new CreditCard();

class Paypal {
  public error = "#paypal-error"
}
export const paypal = new Paypal();