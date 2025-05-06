import { expect } from "chai";
import { Member, Subscription } from "makerspace-ts-api-client";
import { Routing } from "app/constants";
import { timeToDate } from "ui/utils/timeToDate";
import { TablePageObject } from "./table";

const tableId = "subscriptions-table";
const fields = ["nextBilling", "resourceClass", "memberName", "amount", "status"];

class SubscriptionsPageObject extends TablePageObject {
  public listUrl = Routing.Billing

  public fieldEvaluator = (member?: Partial<Member>) => (subscription: Partial<Subscription>) => (fieldContent: { field: string, text: string }) => {
    const { field, text } = fieldContent;
    if (field === "nextBilling") {
      expect(text).to.eql(timeToDate(subscription.nextBillingDate));
    } else if (field === "status") {
      expect(
        ["Active", "Expired"].some((status => new RegExp(status, 'i').test(text)))
      ).to.be.true;
    } else if (field === "memberName") {
      if (member) {
        expect(text).to.eql(`${member.firstname} ${member.lastname}`);
      } else {
        expect(!!text).to.be.true;
      }
    } else {
      expect(text.includes(subscription[field])).to.be.true;
    }
  }

  public actionButtons = {
    delete: "#subscription-option-cancel",
  }

  private cancelSubscriptionModalId = "#cancel-subscription";
  public cancelSubscriptionModal = {
    id: `${this.cancelSubscriptionModalId}-confirm`,
    status: `#subscription-status`,
    type: "#subscription-type",
    nextPayment: `#subscription-next-payment`,
    submit: `${this.cancelSubscriptionModalId}-submit`,
    cancel: `${this.cancelSubscriptionModalId}-cancel`,
    error: `${this.cancelSubscriptionModalId}-error`,
    loading: `${this.cancelSubscriptionModalId}-loading`,
  }
}

export default new SubscriptionsPageObject(tableId, fields);