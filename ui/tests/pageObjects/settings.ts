import { Routing } from "app/constants";
import utils from "./common";

class Settings {
  public pageUrl = Routing.Settings;
  public buildPageUrl = (memberId: string) => Routing.Settings.replace(Routing.PathPlaceholder.MemberId, memberId);

  public menu = {
    profile: "#settings-profile",
    membership: "#settings-membership",
    paymentMethods: "#settings-payment-methods",
    loading: "#settings-loading"
  }

  public subscriptionDetails = {
    loading: "#subscription-settings-loading",
    name: "#cancel-subscription-name",
    description: "#cancel-subscription-description",
    status: "#subscription-status",
    nextPayment: "#subscription-next-payment",
    changePaymentMethod: "#subscription-option-payment-method",
    cancelSubscription: "#subscription-option-cancel",
  }

  public nonSubscriptionDetails = {
    loading: "#subscription-settings-loading",
    expiration: "#member-detail-expiration",
    status: "#member-detail-status",
    membershipType: "#member-detail-type",
    createSubscription: "#settings-create-membership-button",
  }

  public waitForLoad = () => utils.waitForNotVisible(this.menu.loading);
  public goToProfileSettings = () => utils.clickElement(this.menu.profile);
  public goToMembershipSettings = () => utils.clickElement(this.menu.membership);
  public goToPaymentMethods = () => utils.clickElement(this.menu.paymentMethods);
}

export default new Settings();