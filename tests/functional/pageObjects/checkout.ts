import { Routing } from "app/constants";
import { TablePageObject } from "./table";

const paymentErrorModalTableId = "#payment-error-modal #payment-invoices-table"
export class PaymentErrorModal extends TablePageObject {
  public fields = [
    "name", "description", "amount"
  ]

  private paymentErrorModalId = "#payment-error-modal"
  public paymentErrorModal = {
    id: this.paymentErrorModalId,
    error: `${this.paymentErrorModalId}-error`,
    submitButton: `${this.paymentErrorModalId}-submit`,
  }
}

const checkoutInvoicesTable = "#checkout-invoices-table";
export class CheckoutPageObject extends TablePageObject {
  public checkoutUrl = Routing.Checkout
  public fields = [
    "name", "description", "amount"
  ]

  public getDiscount = (rowId: string) => this.getColumnText("description #discount", rowId)
  public total = "#total"
  public totalError = "#total-error"
  public checkoutError = "#checkout-submitting-error"
  public submit = "#submit-payment-button"

}

export const paymentErrorModal = new PaymentErrorModal(paymentErrorModalTableId);
export const checkout = new CheckoutPageObject(checkoutInvoicesTable);