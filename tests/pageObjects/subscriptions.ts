import { TablePageObject } from "./table";
import { Routing } from "app/constants";
import { Subscription } from "app/entities/subscription";
import { MemberDetails } from "app/entities/member";
import { timeToDate } from "ui/utils/timeToDate";

const tableId = "subscriptions-table";
const fields = ["nextBilling", "resourceClass", "memberName", "amount", "status"];

class SubscriptionsPageObject extends TablePageObject {
  public listUrl = Routing.Billing

  public fieldEvaluator = (member?: Partial<MemberDetails>) => (subscription: Partial<Subscription>) => (fieldContent: { field: string, text: string }) => {
    const { field, text } = fieldContent;
    if (field === "nextBilling") {
      expect(text).toEqual(timeToDate(subscription.nextBillingDate));
    } else if (field === "status") {
      expect(
        ["Active", "Expired"].some((status => new RegExp(status, 'i').test(text)))
      ).toBeTruthy();
    } else if (field === "memberName") {
      if (member) {
        expect(text).toEqual(`${member.firstname} ${member.lastname}`);
      } else {
        expect(text).toBeTruthy();
      }
    } else {
      expect(text.includes(subscription[field])).toBeTruthy();
    }
  }

  public actionButtons = {
    delete: "#subscriptions-list-delete",
  }

  private cancelSubscriptionModalId = "#cancel-subscription";
  public cancelSubscriptionModal = {
    id: `${this.cancelSubscriptionModalId}-confirm`,
    status: `${this.cancelSubscriptionModalId}-status`,
    resourceClass: `${this.cancelSubscriptionModalId}-resource`,
    member: `${this.cancelSubscriptionModalId}-member`,
    nextPayment: `${this.cancelSubscriptionModalId}-next-payment`,
    submit: `${this.cancelSubscriptionModalId}-submit`,
    cancel: `${this.cancelSubscriptionModalId}-cancel`,
    error: `${this.cancelSubscriptionModalId}-error`,
    loading: `${this.cancelSubscriptionModalId}-loading`,
  }

  public filters = {
    hideCancelled: "#hide-cancelled",
  }
}

export default new SubscriptionsPageObject(tableId, fields);