import { Routing } from "app/constants";
import { TablePageObject } from "./table";

const paymentErrorModalTableId = "#payment-error-modal #payment-invoices-table"
const paymentErrorFields = ["name", "description", "amount"]
export class PaymentErrorModal extends TablePageObject {


  private paymentErrorModalId = "#payment-error-modal"
  public paymentErrorModal = {
    id: this.paymentErrorModalId,
    error: `${this.paymentErrorModalId}-error`,
    submitButton: `${this.paymentErrorModalId}-submit`,
  }
}

const checkoutInvoicesTable = "#checkout-invoices-table";
const checkoutFields = ["name", "description", "amount"]
export class CheckoutPageObject extends TablePageObject {
  public checkoutUrl = Routing.Checkout


  public getDiscount = (rowId: string) => this.getColumnText("description #discount", rowId)
  public total = "#total"
  public totalError = "#total-error"
  public checkoutError = "#checkout-submitting-error"
  public submit = "#submit-payment-button"


  public receiptTransactions = (transactionId: string) => `#transaction-${transactionId}`;
  public backToProfileButton = "#return-to-profile";
}

export const paymentErrorModal = new PaymentErrorModal(paymentErrorModalTableId, paymentErrorFields);
export const checkout = new CheckoutPageObject(checkoutInvoicesTable, checkoutFields);