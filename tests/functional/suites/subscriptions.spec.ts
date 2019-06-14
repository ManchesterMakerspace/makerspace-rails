import { basicUser, adminUser } from "../../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";

import header from "../../pageObjects/header";
import utils from "../../pageObjects/common";
import billingPO from "../../pageObjects/billing";
import subscriptionsPO from "../../pageObjects/subscriptions";
import { defaultSubscription, defaultSubscriptions } from "../../constants/subscription";
import { autoLogin } from "../autoLogin";

describe("Paid Subscriptions", () => {
  describe("Admin subscription", () => {
    beforeEach(async () => {
      return autoLogin(adminUser, undefined, { billing: true }).then(async () => {
        await mock(mockRequests.subscriptions.get.ok(defaultSubscriptions, {}, true));
        await header.navigateTo(header.links.billing);
        await utils.waitForPageLoad(billingPO.url);
        await billingPO.goToSubscriptions();
        // Wait for table load
        expect(await utils.isElementDisplayed(subscriptionsPO.getErrorRowId())).toBeFalsy();
        expect(await utils.isElementDisplayed(subscriptionsPO.getNoDataRowId())).toBeFalsy();
        expect(await utils.isElementDisplayed(subscriptionsPO.getLoadingId())).toBeFalsy();
        expect(await utils.isElementDisplayed(subscriptionsPO.getTitleId())).toBeTruthy();
      });
    });
    it("Loads a list of subscriptions", async () => {
      await subscriptionsPO.verifyListView(defaultSubscriptions, subscriptionsPO.fieldEvaluator());
    });
    it("Can cancel a subscriptoin", async () => {
      await subscriptionsPO.selectRow(defaultSubscriptions[0].id);
      await utils.clickElement(subscriptionsPO.actionButtons.delete);
      await utils.waitForVisible(subscriptionsPO.cancelSubscriptionModal.submit);
      expect(await utils.getElementText(subscriptionsPO.cancelSubscriptionModal.member)).toEqual(defaultSubscriptions[0].memberName);
      expect(await utils.getElementText(subscriptionsPO.cancelSubscriptionModal.status)).toEqual(defaultSubscriptions[0].status);
      expect(await utils.getElementText(subscriptionsPO.cancelSubscriptionModal.resourceClass)).toEqual(defaultSubscriptions[0].resourceClass);
      await mock(mockRequests.subscription.delete.ok(defaultSubscriptions[0].id, true));
      await mock(mockRequests.subscriptions.get.ok([], undefined, true));
      await utils.clickElement(subscriptionsPO.cancelSubscriptionModal.submit);
      await utils.waitForNotVisible(subscriptionsPO.cancelSubscriptionModal.submit);
      await utils.waitForVisible(subscriptionsPO.getNoDataRowId());
    });
  });

  describe("Own subscription", () => {
    const initSubscription = {
      ...defaultSubscription,
      memberId: basicUser.id,
      memberName: `${basicUser.firstname} ${basicUser.lastname}`,
    };
    beforeEach(() => {
      return autoLogin(basicUser, undefined, { billing: true });
    });

    it("Displays information about current subscriptions/membership", () => {
      // TODO
    });
    it("Can change the payment method on their subscriptions", () => {
      // TODO
    });
    it("Can cancel their subscriptions", async () => {
      // TODO
    });
  })
});
