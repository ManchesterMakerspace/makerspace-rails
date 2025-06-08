import { expect } from "chai"
import { basicUser, adminUser } from "../../constants/member";

import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import header from "../../pageObjects/header";
import utils from "../../pageObjects/common";
import settingsPO from "../../pageObjects/settings";
import billingPO from "../../pageObjects/billing";
import signup from "../../pageObjects/signup";
import { checkout as checkoutPo } from "../../pageObjects/checkout";
import subscriptionsPO from "../../pageObjects/subscriptions";
import { baseInvoice, defaultBillingOptions as invoiceOptions, membershipOptionQueryParams } from "../../constants/invoice";
import { defaultSubscription, defaultSubscriptions } from "../../constants/subscription";
import { creditCard as defaultCreditCard } from "../../constants/paymentMethod";
import { autoLogin } from "../autoLogin";
import { defaultTransactions } from "../../constants/transaction";
import { defaultInvoice } from "../../constants/invoice";
import { paymentMethods } from "../../pageObjects/paymentMethods";
import memberPO from "../../pageObjects/member";
import { LoginMember } from "../../pageObjects/auth";
import { timeToDate } from "ui/utils/timeToDate";
import { loadMockserver } from "../mockserver";
import { Invoice } from "makerspace-ts-api-client";
import { generateClientToken, loadBraintreeMockserver, mockBraintreeTokenValidation } from "../../constants/braintreeMockserver";
const mocker = loadMockserver();
loadBraintreeMockserver();

describe("Paid Subscriptions", () => {
  beforeEach(() => {
    mocker.getNewPaymentMethod_200({
      clientToken: generateClientToken()
    }, { unlimited: true });
    mockBraintreeTokenValidation(defaultCreditCard);
  });

  describe("Admin subscription", () => {
    beforeEach(async () => {
      return autoLogin(mocker, adminUser, undefined, { billing: true }).then(async () => {
        mocker.adminListSubscriptions_200({ }, defaultSubscriptions);
        await header.navigateTo(header.links.billing);
        await utils.waitForPageLoad(billingPO.url);
        await billingPO.goToSubscriptions();
        // Wait for table load
        expect(await utils.isElementDisplayed(subscriptionsPO.getErrorRowId())).to.be.false;
        expect(await utils.isElementDisplayed(subscriptionsPO.getNoDataRowId())).to.be.false;
        expect(await utils.isElementDisplayed(subscriptionsPO.getLoadingId())).to.be.false;
        expect(await utils.isElementDisplayed(subscriptionsPO.getTitleId())).to.be.true;
      });
    });
    it("Loads a list of subscriptions", async () => {
      await subscriptionsPO.verifyListView(defaultSubscriptions, subscriptionsPO.fieldEvaluator());
    });
    it("Can cancel a subscriptoin", async () => {
      await subscriptionsPO.selectRow(defaultSubscriptions[0].id);
      await utils.clickElement(subscriptionsPO.actionButtons.delete);
      await utils.waitForVisible(subscriptionsPO.cancelSubscriptionModal.submit);
      await utils.waitForNotVisible(subscriptionsPO.cancelSubscriptionModal.loading);
      expect(await utils.getElementText(subscriptionsPO.cancelSubscriptionModal.status)).to.eql(defaultSubscriptions[0].status);
      expect(await utils.getElementText(subscriptionsPO.cancelSubscriptionModal.nextPayment)).to.eql(timeToDate(defaultSubscriptions[0].nextBillingDate));
      mocker.adminCancelSubscription_204({ id: defaultSubscriptions[0].id });
      mocker.adminListSubscriptions_200({ }, []);
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

    const newCard = {
      ...defaultCreditCard,
      nonce: "foobar"
    }
      const membershipId = "foo";
      const membershipOption = {
        ...invoiceOptions.find((io) => io.id === membershipId),
        amount: initSubscription.amount,
      }

    it("Displays information about current subscriptions and membership", async () => {
      await autoLogin(mocker, basicUser, undefined, { billing: true });
      mocker.getMember_200({ id: basicUser.id }, basicUser);
      await header.navigateTo(header.links.settings);
      await utils.waitForPageToMatch(settingsPO.pageUrl);

      mocker.listInvoices_200({}, []);
      mocker.getMember_200({ id: basicUser.id }, basicUser);

      await settingsPO.goToMembershipSettings();

      // Non subscription details displayed
      await utils.waitForNotVisible(settingsPO.nonSubscriptionDetails.loading);
      expect(await utils.isElementDisplayed(settingsPO.nonSubscriptionDetails.status)).to.be.true;

      const newInvoice: Invoice = {
        ...baseInvoice,
        memberId: basicUser.id,
      };
      mocker.createInvoice_200({ body: membershipOption }, newInvoice);
      mocker.listInvoiceOptions_200(membershipOptionQueryParams, [membershipOption], { unlimited: true });
      mocker.listPaymentMethods_200([newCard]);
      mocker.getPaymentMethod_200({ id: newCard.id }, newCard);
      await utils.clickElement(settingsPO.nonSubscriptionDetails.createSubscription);
      await utils.waitForNotVisible(signup.membershipSelectForm.loading);
      await signup.selectMembershipOption(membershipId, false);
      await signup.goNext();

      // Submit payment
      const subscribedMember = { ...basicUser, subscriptionId: initSubscription.id, subscription: true };
      const defaultTransaction = { ...defaultTransactions[0], invoice: defaultInvoice };
      mocker.createTransaction_200({ body: { invoiceOptionId: membershipId, paymentMethodId: newCard.id } }, defaultTransaction);
      mocker.getMember_200({ id: basicUser.id }, subscribedMember);
      mocker.signIn_200({ body: {} }, subscribedMember);
      mocker.listMembersPermissions_200({ id: subscribedMember.id }, { billing: true });
      await utils.waitForNotVisible(paymentMethods.paymentMethodFormSelect.loading);
      await utils.clickElement(paymentMethods.getPaymentMethodSelectId(newCard.id));
      await signup.goNext();

      const total = numberAsCurrency(initSubscription.amount);
      expect(await utils.getElementText(checkoutPo.total)).to.eql(`Total Due: ${total}`);
      // Accept recurring payment authorization
      await utils.waitForVisible(checkoutPo.authAgreementCheckbox);
      await utils.clickElement(checkoutPo.authAgreementCheckbox);

      await signup.goNext();

      // Wait for profile redirect
      await utils.waitForPageLoad(memberPO.getProfilePath(basicUser.id));

      const subscriptionInvoice = {
        ...defaultInvoice,
        subscriptionId: initSubscription.id,
      };
      await header.navigateTo(header.links.settings);
      await utils.waitForPageToMatch(settingsPO.pageUrl);

      mocker.getSubscription_200({ id: initSubscription.id }, initSubscription);
      mocker.listInvoices_200({}, [subscriptionInvoice]);
      mocker.getMember_200({ id: basicUser.id }, {
        ...basicUser,
        subscription: true,
        subscriptionId: initSubscription.id,
      });
      await settingsPO.goToMembershipSettings();

      // Subscription details displayed
      await utils.waitForNotVisible(settingsPO.nonSubscriptionDetails.loading);
      expect(await utils.isElementDisplayed(settingsPO.nonSubscriptionDetails.status)).to.be.false;
      expect(await utils.isElementDisplayed(settingsPO.subscriptionDetails.status)).to.be.true;
    });

    it("Can cancel their subscriptions", async () => {
      await autoLogin(mocker, {
        ...basicUser,
        subscriptionId: initSubscription.id,
      } as LoginMember, undefined, { billing: true });

      const subscriptionInvoice = {
        ...defaultInvoice,
        subscriptionId: initSubscription.id,
      };

      await header.navigateTo(header.links.settings);
      await utils.waitForPageToMatch(settingsPO.pageUrl);

      // Mock for subscription details
      const subscriptionMember = {
        ...basicUser,
        subscriptionId: initSubscription.id,
      };
      mocker.getSubscription_200({ id: initSubscription.id }, initSubscription);
      mocker.listInvoices_200({}, [subscriptionInvoice]);
      mocker.getMember_200({ id: basicUser.id }, subscriptionMember);
      await settingsPO.goToMembershipSettings();

      // Subscription details displayed
      await utils.waitForNotVisible(settingsPO.subscriptionDetails.loading);
      expect(await utils.isElementDisplayed(settingsPO.subscriptionDetails.status)).to.be.true;

      await utils.clickElement(settingsPO.subscriptionDetails.cancelSubscription);
      await utils.waitForVisible(subscriptionsPO.cancelSubscriptionModal.submit);
      expect(await utils.getElementText(subscriptionsPO.cancelSubscriptionModal.status)).to.eql(defaultSubscriptions[0].status);

      mocker.cancelSubscription_204({ id: initSubscription.id });
      mocker.getMember_200({ id: basicUser.id }, basicUser);
      mocker.listInvoices_200({}, []);

      await utils.clickElement(subscriptionsPO.cancelSubscriptionModal.submit);
      await utils.waitForNotVisible(subscriptionsPO.cancelSubscriptionModal.submit);
      await utils.waitForNotVisible(settingsPO.nonSubscriptionDetails.loading);
      expect(await utils.isElementDisplayed(settingsPO.nonSubscriptionDetails.status)).to.be.true;
      expect(await utils.isElementDisplayed(settingsPO.subscriptionDetails.status)).to.be.false;
    });
  })
});
