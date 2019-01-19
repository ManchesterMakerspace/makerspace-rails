import { Routing } from "app/constants";
const paymentOptionsTableId = "#billing-options-table"
class Billing extends TablePageObject {
  public url = Routing.Billing

  public fields = [
    "name", "description", "quantity", "amount", "disabled"
  ]

  public actionButtons = {
    "create": "#billing-list-create",
    "renew": "#billing-list-renew",
    "delete": "#billing-list-delete",
  }

  private invoiceOptionFormId = "#invoice-option-form"
  public invoiceOptionForm = {
    id: this.invoiceOptionFormId,
    resourceClass: `${this.invoiceOptionFormId}-type`,
    subscriptionId: `${this.invoiceOptionFormId}-billing-plan`,
    discountId: `${this.invoiceOptionFormId}-discount`,
    name: `${this.invoiceOptionFormId}-name`,
    description: `${this.invoiceOptionFormId}-description`,
    amount: `${this.invoiceOptionFormId}-quantity`,
    disabled: `${this.invoiceOptionFormId}-disabled`,
    submit: `${this.invoiceOptionFormId}-submit`,
    cancel: `${this.invoiceOptionFormId}-cancel`,
  }

  private deleteId = "#delete-invoice-option-confirm"
  public deleteModal = {
    id: this.deleteId,
    name: "#delete-invoice-option-name",
    description: "#delete-invoice-option-description",
    amount: "#delete-invoice-option-amount",
    submit: `${this.deleteId}-submit`,
    cancel: `${this.deleteId}-cancel`,
  }
}

export default new Billing(paymentOptionsTableId)