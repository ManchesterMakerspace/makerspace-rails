import { InvoiceOption } from "app/entities/invoice";
import { Routing } from "app/constants";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { TablePageObject } from "./table";
import { MemberDetails } from "app/entities/member";
import utils from "./common";

const paymentOptionsTableId = "billing-options-table"
const fields = [
  "name", "description", "quantity", "amount", "disabled"
];
class Billing extends TablePageObject {
  public url = Routing.Billing;

  public fieldEvaluator = (member?: Partial<MemberDetails>) => (invoiceOption: Partial<InvoiceOption>) => (fieldContent: { field: string, text: string }) => {
    const { field, text } = fieldContent;
    if (field === "status") {
      expect(
        ["Active", "Expired"].some((status => new RegExp(status, 'i').test(text)))
      ).toBeTruthy();
    } else if (field === "member") {
      if (member) {
        expect(text).toEqual(`${member.firstname} ${member.lastname}`);
      } else {
        expect(text).toBeTruthy();
      }
    } else if (field === "amount") {
      expect(numberAsCurrency(invoiceOption[field])).toEqual(text);
    } else if (field === "disabled") {
      const expectedText = invoiceOption[field] ? "Disabled" : "Enabled";
      expect(text.includes(expectedText)).toBeTruthy();
    } else {
      expect(text.includes(invoiceOption[field])).toBeTruthy();
    }
  }

  public actionButtons = {
    createButton: "#billing-list-create",
    editButton: "#billing-list-edit",
    deleteButton: "#billing-list-delete",
  }

  public billingTabs = {
    subscriptionsTab: "#subscriptions-tab",
    transactionsTab: "#transactions-tab",
    optionsTab: "#options-tab",
  }

  public goToSubscriptions = () =>
    utils.clickElement(this.billingTabs.subscriptionsTab);

  public goToTransactions = () =>
    utils.clickElement(this.billingTabs.transactionsTab);

  public goToOptions = () =>
    utils.clickElement(this.billingTabs.optionsTab);

  private invoiceOptionFormId = "#invoice-option-form"
  public invoiceOptionForm = {
    id: this.invoiceOptionFormId,
    resourceClass: `${this.invoiceOptionFormId}-type`,
    subscriptionId: `${this.invoiceOptionFormId}-billing-plan`,
    discountId: `${this.invoiceOptionFormId}-discount`,
    name: `${this.invoiceOptionFormId}-name`,
    description: `${this.invoiceOptionFormId}-description`,
    amount: `${this.invoiceOptionFormId}-amount`,
    quantity: `${this.invoiceOptionFormId}-quantity`,
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

export default new Billing(paymentOptionsTableId, fields);