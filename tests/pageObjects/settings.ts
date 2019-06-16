import { Routing } from "app/constants";
import utils from "./common";

class Settings {
  public pageUrl = Routing.Settings;

  public menu = {
    profile: "#settings-profile",
    membership: "#settings-membership",
    paymentMethods: "#settings-payment-methods",
  }

  public subscriptionDetails = {
    loading: "#update-membership-modal-loading",
    name: "#cancel-subscription-name",
    description: "#cancel-subscription-description",
    status: "#subscription-status",
    nextPayment: "#subscription-next-payment",
    changePaymentMethod: "#subscription-option-payment-method",
    cancelSubscription: "#subscription-option-cancel",
  }

  public nonSubscriptionDetails = {
    loading: "#update-membership-modal-loading",
    expiration: "#member-detail-expiration",
    status: "#member-detail-status",
    membershipType: "#member-detail-type",
    createSubscription: "#settings-create-membership-button",
  }

  public goToProfileSettings = () => utils.clickElement(this.menu.profile);
  public goToMembershipSettings = () => utils.clickElement(this.menu.membership);
  public goToPaymentMethods = () => utils.clickElement(this.menu.paymentMethods);
}

export default new Settings();