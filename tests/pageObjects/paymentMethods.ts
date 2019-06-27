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

  private changePaymentMethodId = "#change-payment-method";
  public changePaymentMethod = {
    error: `${this.changePaymentMethodId}-error`,
    submit: `${this.changePaymentMethodId}-submit`,
    cancel: `${this.changePaymentMethodId}-cancel`,
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
    csv: `#cvv`,
    expirationDate: `#expiration`,
    postalCode: `#postal-code`,
    submit: `${this.creditCardFormId}-submit`,
    loading: `${this.creditCardFormId}-loading`,
  }

  public iframes = {
    cardNumber: "braintree-hosted-field-number",
    expirationDate: "braintree-hosted-field-expirationDate",
    csv: "braintree-hosted-field-cvv",
    postalCode: "braintree-hosted-field-postalCode",
  }

  private switchToFrame = async (field: string): Promise<void> => {
    const frame = browser.findElement(By.id(this.iframes[field]));
    return browser.switchTo().frame(frame);
  }

  public fillInput = async (field: string, input: string): Promise<void> => {
    await this.switchToFrame(field);
    await utils.fillInput(this.creditCardForm[field], input);
    await browser.switchTo().defaultContent();
  }

  public getInput = async (field: string): Promise<string> => {
    await this.switchToFrame(field);
    const val = await utils.getElementText(this.creditCardForm[field]);
    await browser.switchTo().defaultContent();
    return val;
  }
}

export const creditCard = new CreditCard();

class Paypal {
  public error = "#paypal-error"
}
export const paypal = new Paypal();