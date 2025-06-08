import { expect } from "chai";
import moment from "moment";
import auth from "../../pageObjects/auth";
import utils from "../../pageObjects/common";
import signup from "../../pageObjects/signup";
import header from "../../pageObjects/header";
import billingPO from "../../pageObjects/billing";
import subscriptionPO from "../../pageObjects/subscriptions";
import { checkout as checkoutPo } from "../../pageObjects/checkout";
import settingsPO from "../../pageObjects/settings";
import { paymentMethods, creditCard } from "../../pageObjects/paymentMethods";
import { Routing } from "app/constants";
import { dateToTime } from "ui/utils/timeToDate";
import { cancelMemberSubscription, createRejectCard, getAdminUserLogin, getBasicUserLogin, invoiceOptionIds, paypalUserLogins } from "../../constants/api_seed_data";
import { newVisa, newMastercard } from "../../constants/paymentMethod";
import { checkout } from "../../pageObjects/checkout";
import memberPO from "../../pageObjects/member";
import { selfRegisterMember } from "../utils/auth";
import { buildTestMember } from "../../constants/member";
const payPalMember = paypalUserLogins.shift();

describe("Membership", () => {
  beforeEach(async () => {
    await browser.deleteAllCookies();
    await browser.pause(1000);
    return browser.url(utils.buildUrl());
  });

  afterEach(async () => {
    const displayed = await utils.isElementDisplayed(header.links.logout);
    if (displayed) {
      await header.navigateTo(header.links.logout);
      await utils.waitForVisible(header.loginLink);
    }
  });

  it("Members can create a membership, change payment methods and cancel their membership", async () => {
    await auth.goToLogin();
    await auth.signInUser(getBasicUserLogin());
    await header.navigateTo(header.links.settings);
    await utils.waitForPageToMatch(settingsPO.pageUrl);
    await settingsPO.waitForLoad();
    await settingsPO.goToMembershipSettings();

    // Non subscription details displayed
    await utils.waitForNotVisible(settingsPO.nonSubscriptionDetails.loading);
    expect(await utils.isElementDisplayed(settingsPO.nonSubscriptionDetails.status)).to.be.true;
    expect(await utils.isElementDisplayed(settingsPO.subscriptionDetails.status)).to.be.false;

    // Select a subscription
    await utils.clickElement(settingsPO.nonSubscriptionDetails.createSubscription);
    await utils.waitForVisible(signup.signUpControls.cartPreview);
    await signup.selectMembershipOption(invoiceOptionIds.monthly, false);
    await signup.goNext();

    // Add a payment method
    await utils.waitForNotVisible(paymentMethods.paymentMethodSelect.loading);
    expect((await paymentMethods.getPaymentMethods()).length).to.eql(0);
    await utils.clickElement(paymentMethods.paymentMethodAccordian.creditCard);

    await creditCard.fillInput("cardNumber", newVisa.number);
    await creditCard.fillInput("csv", newVisa.csv);
    await creditCard.fillInput("expirationDate", newVisa.expiration);
    await creditCard.fillInput("postalCode", newVisa.postalCode);
    await creditCard.fillInput("cardholderName", newVisa.name);
    await signup.goNext();

    // Select the payment method
    await utils.waitForNotVisible(paymentMethods.paymentMethodSelect.loading);
    await utils.waitForNotVisible(paymentMethods.paymentMethodAccordian.creditCard);

    // Accept recurring payment authorization
    await utils.waitForVisible(checkoutPo.authAgreementCheckbox);
    await utils.clickElement(checkoutPo.authAgreementCheckbox);
    await signup.goNext();
    await utils.waitForPageToMatch(Routing.Profile);
    // TODO: Verify subscription & receipt emails

    await header.navigateTo(header.links.settings);
    await utils.waitForPageToMatch(settingsPO.pageUrl);
    await settingsPO.waitForLoad();
    await settingsPO.goToMembershipSettings();

    // Subscription details displayed
    await utils.waitForNotVisible(settingsPO.subscriptionDetails.loading);
    await utils.waitForVisible(settingsPO.subscriptionDetails.status);
    expect(await utils.isElementDisplayed(settingsPO.subscriptionDetails.status)).to.be.true;
    expect(await utils.isElementDisplayed(settingsPO.nonSubscriptionDetails.status)).to.be.false;
    // Change payment method
    await utils.clickElement(settingsPO.subscriptionDetails.changePaymentMethod);

    // Add a payment method
    await utils.waitForNotVisible(paymentMethods.paymentMethodSelect.loading);
    await browser.waitUntil(async () => {
      const numPaymentMethods = (await paymentMethods.getPaymentMethods()).length;
      return numPaymentMethods === 1;
    }, undefined, "Payment methods table never reloaded");
    await utils.clickElement(paymentMethods.addPaymentButton);
    await utils.waitForVisible(paymentMethods.paymentMethodFormSelect.creditCard);
    await utils.waitForNotVisible(paymentMethods.paymentMethodFormSelect.loading);
    await utils.clickElement(paymentMethods.paymentMethodFormSelect.creditCard);

    await utils.waitForVisible(creditCard.creditCardForm.submit);
    await utils.waitForNotVisible(creditCard.creditCardForm.loading);
    await creditCard.fillInput("cardNumber", newMastercard.number);
    await creditCard.fillInput("csv", newMastercard.csv);
    await creditCard.fillInput("expirationDate", newMastercard.expiration);
    await creditCard.fillInput("postalCode", newMastercard.postalCode);
    await creditCard.fillInput("cardholderName", newMastercard.name);
    await utils.clickElement(creditCard.creditCardForm.submit);
    await utils.waitForNotVisible(creditCard.creditCardForm.loading);
    await utils.waitForNotVisible(creditCard.creditCardForm.submit);

    // Select the payment method
    // TODO: new payment methods should be auto selected
    await utils.waitForNotVisible(paymentMethods.paymentMethodSelect.loading);
    await browser.waitUntil(async () => {
      const numPaymentMethods = (await paymentMethods.getPaymentMethods()).length;
      return numPaymentMethods === 2;
    }, undefined, "Payment methods table never reloaded");
    await paymentMethods.selectPaymentMethodByIndex(0);

    // TODO: Verify correct payment method is selected when reopening
    await utils.clickElement(paymentMethods.changePaymentMethod.submit);
    await utils.waitForNotVisible(paymentMethods.changePaymentMethod.submit);

    // Cancel subscription
    await utils.clickElement(settingsPO.subscriptionDetails.cancelSubscription);
    await utils.waitForVisible(subscriptionPO.cancelSubscriptionModal.submit);
    await utils.waitForNotVisible(subscriptionPO.cancelSubscriptionModal.loading);
    await utils.clickElement(subscriptionPO.cancelSubscriptionModal.submit);
    await utils.waitForNotVisible(subscriptionPO.cancelSubscriptionModal.loading);
    await utils.waitForNotVisible(subscriptionPO.cancelSubscriptionModal.submit);

    // Non subscription details displayed
    await utils.waitForNotVisible(settingsPO.nonSubscriptionDetails.loading);
    await utils.waitForVisible(settingsPO.nonSubscriptionDetails.status);
    expect(await utils.isElementDisplayed(settingsPO.nonSubscriptionDetails.status)).to.be.true;
    expect(await utils.isElementDisplayed(settingsPO.subscriptionDetails.status)).to.be.false;
  });

  it("Members can cancel a membership and sign back up", async () => {
    const rejectionUid = "member-sign-back-up";
    await createRejectCard(rejectionUid);
    const newMember = buildTestMember("cancel-sign-up");
    await selfRegisterMember(newMember);
    // Add a payment method
    await utils.waitForVisible(paymentMethods.paymentMethodAccordian.creditCard);
    expect((await paymentMethods.getPaymentMethods()).length).to.eql(0);
    await utils.clickElement(paymentMethods.paymentMethodAccordian.creditCard);
    await creditCard.fillInput("cardNumber", newVisa.number);
    await creditCard.fillInput("csv", newVisa.csv);
    await creditCard.fillInput("expirationDate", newVisa.expiration);
    await creditCard.fillInput("postalCode", newVisa.postalCode);
    await creditCard.fillInput("cardholderName", newVisa.name);
    await signup.goNext();
    await utils.waitForNotVisible(paymentMethods.paymentMethodAccordian.creditCard);
    // Accept recurring payment authorization
    await utils.waitForVisible(checkout.authAgreementCheckbox);
    await utils.clickElement(checkout.authAgreementCheckbox);
    // Submit payment
    await signup.goNext();
    await utils.waitForPageToMatch(Routing.Profile);
    await utils.waitForNotVisible(memberPO.memberDetail.loading);
    await utils.waitForVisible(memberPO.memberDetail.notificationModalSubmit);
    await utils.clickElement(memberPO.memberDetail.notificationModalSubmit);
    await utils.waitForNotVisible(memberPO.memberDetail.notificationModalSubmit);
    const memberProfileUrl = (await browser.getUrl());
    // Verify no expiration set from user POV
    await memberPO.verifyProfileInfo({
      ...newMember,
      expirationTime: undefined
    });

    // Logout
    await header.navigateTo(header.links.logout);
    await utils.waitForVisible(header.loginLink);
    // Login as Admin
    await auth.goToLogin();
    await auth.signInUser(getAdminUserLogin());
    await utils.waitForPageToMatch(Routing.Profile);
    // View new member's profile
    await browser.url(memberProfileUrl);
    await utils.waitForPageToMatch(Routing.Profile);

    // Register a card to start their membership
    await memberPO.verifyProfileInfo({
      ...newMember,
      expirationTime: undefined
    });
    expect(await utils.getElementText(memberPO.memberDetail.openCardButton)).to.match(/Register Fob/i);
    await memberPO.openCardModal();
    await utils.waitForVisible(memberPO.accessCardForm.submit);
    await utils.waitForNotVisible(memberPO.accessCardForm.loading);

    await browser.waitUntil(async () => {
      const loadedCard = await utils.getElementText(memberPO.accessCardForm.importConfirmation);
        return rejectionUid === loadedCard;
      }, undefined, `Received rejection card ${await utils.getElementText(memberPO.accessCardForm.importConfirmation)}, expected ${rejectionUid}`);
    await utils.clickElement(memberPO.accessCardForm.idVerification);
    await utils.clickElement(memberPO.accessCardForm.submit);
    expect(await utils.isElementDisplayed(memberPO.accessCardForm.error)).to.be.false
    await utils.waitForNotVisible(memberPO.accessCardForm.submit);
    await utils.waitForNotVisible(memberPO.memberDetail.loading);
    await memberPO.verifyProfileInfo({ // Verify registering card activates the membership
      ...newMember,
      expirationTime: moment().add(1, 'M').valueOf()
    });

    // Logout from admin and back as user
    await header.navigateTo(header.links.logout);
    await utils.waitForVisible(header.loginLink);
    await auth.goToLogin();
    await auth.signInUser(newMember);

    await memberPO.verifyProfileInfo({ // Verify user sees same expiration time
      ...newMember,
      expirationTime: moment().add(1, 'M').valueOf()
    });

    // Navigate to settings and cancel
    await header.navigateTo(header.links.settings);
    await utils.waitForPageToMatch(settingsPO.pageUrl);
    await settingsPO.waitForLoad();
    await settingsPO.goToMembershipSettings();
    // Subscription details displayed
    await utils.waitForNotVisible(settingsPO.subscriptionDetails.loading);
    expect(await utils.isElementDisplayed(settingsPO.subscriptionDetails.status)).to.be.true;

    // Cancel
    await utils.clickElement(settingsPO.subscriptionDetails.cancelSubscription);
    await utils.waitForVisible(subscriptionPO.cancelSubscriptionModal.submit);
    await utils.waitForNotVisible(subscriptionPO.cancelSubscriptionModal.loading);
    await utils.clickElement(subscriptionPO.cancelSubscriptionModal.submit);
    await utils.waitForNotVisible(subscriptionPO.cancelSubscriptionModal.loading);
    await utils.waitForNotVisible(subscriptionPO.cancelSubscriptionModal.submit);

    // View new member's profile
    await browser.url(memberProfileUrl);
    await utils.waitForPageToMatch(Routing.Profile);
    // Cancelling should not impact existing membership time
    await memberPO.verifyProfileInfo({ // Verify user sees same expiration time
      ...newMember,
      expirationTime: moment().add(1, 'M').valueOf()
    });

    // Back to settings
    await header.navigateTo(header.links.settings);
    await utils.waitForPageToMatch(settingsPO.pageUrl);
    await settingsPO.waitForLoad();
    await settingsPO.goToMembershipSettings();

    // Select a new membership and pay for it
    await utils.clickElement(settingsPO.nonSubscriptionDetails.createSubscription);
    await utils.waitForNotVisible(signup.membershipSelectForm.loading);
    await signup.selectMembershipOption(invoiceOptionIds.monthly, false);
    await signup.goNext();


    // Accept default selection in payment
    await utils.waitForNotVisible(paymentMethods.paymentMethodSelect.loading);
    await browser.waitUntil(async () => {
      const numPaymentMethods = (await paymentMethods.getPaymentMethods()).length;
      return numPaymentMethods === 1;
    }, undefined, "Payment methods table never reloaded");

    await signup.goNext();
    await utils.waitForNotVisible(paymentMethods.paymentMethodAccordian.creditCard);
    await utils.waitForVisible(checkout.authAgreementCheckbox);
    await utils.clickElement(checkout.authAgreementCheckbox);
    await signup.goNext();
    await utils.waitForPageToMatch(Routing.Profile);
  });

  it("Members can sign up after cancelling a Braintree membership via Braintree", async () => {
    const rejectionUid = "braintree-member-sign-back-up";
    await createRejectCard(rejectionUid);
    const newMember = buildTestMember("braintree-cancel-sign-up");
    await selfRegisterMember(newMember);
    // Add a payment method
    await utils.waitForVisible(paymentMethods.paymentMethodAccordian.creditCard);
    expect((await paymentMethods.getPaymentMethods()).length).to.eql(0);
    await utils.clickElement(paymentMethods.paymentMethodAccordian.creditCard);
    await creditCard.fillInput("cardNumber", newVisa.number);
    await creditCard.fillInput("csv", newVisa.csv);
    await creditCard.fillInput("expirationDate", newVisa.expiration);
    await creditCard.fillInput("postalCode", newVisa.postalCode);
    await creditCard.fillInput("cardholderName", newVisa.name);
    await signup.goNext();
    await utils.waitForNotVisible(paymentMethods.paymentMethodAccordian.creditCard);
    // Accept recurring payment authorization
    await utils.waitForVisible(checkout.authAgreementCheckbox);
    await utils.clickElement(checkout.authAgreementCheckbox);
    // Submit payment
    await signup.goNext();
    await utils.waitForPageToMatch(Routing.Profile);
    await utils.waitForNotVisible(memberPO.memberDetail.loading);
    await utils.waitForVisible(memberPO.memberDetail.notificationModalSubmit);
    await utils.clickElement(memberPO.memberDetail.notificationModalSubmit);
    await utils.waitForNotVisible(memberPO.memberDetail.notificationModalSubmit);
    const memberProfileUrl = await browser.getUrl();
    // Verify no expiration set from user POV
    await memberPO.verifyProfileInfo({
      ...newMember,
      expirationTime: undefined
    });
    // Logout
    await header.navigateTo(header.links.logout);
    await utils.waitForVisible(header.loginLink);
    // Login as Admin
    await auth.goToLogin();
    await auth.signInUser(getAdminUserLogin());
    await utils.waitForPageToMatch(Routing.Profile);
    // View new member's profile
    await browser.url(memberProfileUrl);
    await utils.waitForPageToMatch(Routing.Profile);
    // Register a card to start their membership
    await memberPO.verifyProfileInfo({
      ...newMember,
      expirationTime: undefined
    });
    expect(await utils.getElementText(memberPO.memberDetail.openCardButton)).to.match(/Register Fob/i);
    await memberPO.openCardModal();
    await utils.waitForVisible(memberPO.accessCardForm.submit);
    await utils.waitForNotVisible(memberPO.accessCardForm.loading);

    await browser.waitUntil(async () => {
      const loadedCard = await utils.getElementText(memberPO.accessCardForm.importConfirmation);
      return rejectionUid === loadedCard;
    }, undefined, `Received rejection card ${await utils.getElementText(memberPO.accessCardForm.importConfirmation)}, expected ${rejectionUid}`);

    await utils.clickElement(memberPO.accessCardForm.idVerification);
    await utils.clickElement(memberPO.accessCardForm.submit);
    expect(await utils.isElementDisplayed(memberPO.accessCardForm.error)).to.be.false
    await utils.waitForNotVisible(memberPO.accessCardForm.submit);
    await utils.waitForNotVisible(memberPO.memberDetail.loading);
    await memberPO.verifyProfileInfo({ // Verify registering card activates the membership
      ...newMember,
      expirationTime: moment().add(1, 'M').valueOf()
    });

    // Logout from admin and back as user
    await header.navigateTo(header.links.logout);
    await utils.waitForVisible(header.loginLink);

    // Cancel user's membership via Braintree notification
    await cancelMemberSubscription(newMember.email);

    // Login and verify user is cancelled
    await auth.goToLogin();
    await auth.signInUser(newMember);
    await memberPO.verifyProfileInfo({ // Verify user sees same expiration time
      ...newMember,
      expirationTime: moment().add(1, 'M').valueOf()
    });

    // Go to settings to start a new membership
    await header.navigateTo(header.links.settings);
    await utils.waitForPageToMatch(settingsPO.pageUrl);
    await settingsPO.waitForLoad();
    await settingsPO.goToMembershipSettings();
    // Select a new membership and pay for it
    await utils.clickElement(settingsPO.nonSubscriptionDetails.createSubscription);
    await utils.waitForNotVisible(signup.membershipSelectForm.loading);
    await signup.selectMembershipOption(invoiceOptionIds.monthly, false);
    await signup.goNext();
    // Accept default payment method
    await utils.waitForNotVisible(paymentMethods.paymentMethodSelect.loading);
    await browser.waitUntil(async () => {
      const numPaymentMethods = (await paymentMethods.getPaymentMethods()).length;
      return numPaymentMethods === 1;
    }, undefined, "Payment methods table never reloaded");
    await signup.goNext();
    // Accept recurring payment authorization
    await utils.waitForVisible(checkoutPo.authAgreementCheckbox);
    await utils.clickElement(checkoutPo.authAgreementCheckbox);
    await signup.goNext();
    await utils.waitForPageToMatch(Routing.Profile);
  });

  it("Members can sign up after canceling a PayPal membership via PayPal", async () => {
    await auth.goToLogin();
    await auth.signInUser(payPalMember);
    await utils.waitForPageToMatch(Routing.Profile);

    const memberProfileUrl = await browser.getUrl();

    const startingExpiration = await utils.getElementText(memberPO.memberDetail.expiration);
    const startingAsMs: number = dateToTime(startingExpiration);
    await memberPO.verifyProfileInfo({ // Verify user sees same expiration time
      ...payPalMember,
      expirationTime: startingAsMs
    } as any);

    // Go to settings to start a new membership
    await header.navigateTo(header.links.settings);
    await utils.waitForPageToMatch(settingsPO.pageUrl);
    await settingsPO.waitForLoad();
    await settingsPO.goToMembershipSettings();
    // PayPal details displayed
    await utils.waitForNotVisible(settingsPO.nonSubscriptionDetails.loading);
    expect(await utils.isElementDisplayed(settingsPO.nonSubscriptionDetails.status)).to.be.true;
    expect(await utils.getElementText(settingsPO.nonSubscriptionDetails.membershipType)).to.contain("PayPal");

    await cancelMemberSubscription(payPalMember.email, true);

    // Go to profile (force new session)
    await browser.url(memberProfileUrl);
    await utils.waitForPageToMatch(Routing.Profile);
    await memberPO.verifyProfileInfo({ // Verify user sees same expiration time
      ...payPalMember,
      expirationTime: startingAsMs
    } as any);

    // Go to settings to start a new membership
    await header.navigateTo(header.links.settings);
    await utils.waitForPageToMatch(settingsPO.pageUrl);
    await settingsPO.waitForLoad();
    await settingsPO.goToMembershipSettings();
    // Select a new membership and pay for it
    await utils.clickElement(settingsPO.nonSubscriptionDetails.createSubscription);
    await utils.waitForNotVisible(signup.membershipSelectForm.loading);
    await signup.selectMembershipOption(invoiceOptionIds.monthly, false);
    await signup.goNext();

    // Add a payment method
    await utils.waitForNotVisible(paymentMethods.paymentMethodFormSelect.loading);
    expect((await paymentMethods.getPaymentMethods()).length).to.eql(0);
    await utils.clickElement(paymentMethods.paymentMethodAccordian.creditCard);
    await utils.waitForNotVisible(paymentMethods.paymentMethodFormSelect.loading);

    await utils.waitForNotVisible(creditCard.creditCardForm.loading);
    await creditCard.fillInput("cardNumber", newVisa.number);
    await creditCard.fillInput("csv", newVisa.csv);
    await creditCard.fillInput("expirationDate", newVisa.expiration);
    await creditCard.fillInput("postalCode", newVisa.postalCode);
    await creditCard.fillInput("cardholderName", newVisa.name);
    await signup.goNext();
    await utils.waitForNotVisible(paymentMethods.paymentMethodAccordian.creditCard);
    // Accept recurring payment authorization
    await utils.waitForVisible(checkoutPo.authAgreementCheckbox);
    await utils.clickElement(checkoutPo.authAgreementCheckbox);
    await signup.goNext();
    await utils.waitForPageToMatch(Routing.Profile);
    await memberPO.verifyProfileInfo({ // Verify user sees updated expiration time
      ...payPalMember,
      expirationTime: moment(startingAsMs).add(1, "months").valueOf()
    } as any);
  });

  it("Admins can cancel a membership", async function () {
    this.timeout(300 * 1000);
    await auth.goToLogin();
    await auth.signInUser(getBasicUserLogin());
    await header.navigateTo(header.links.settings);
    await utils.waitForPageToMatch(settingsPO.pageUrl);
    await settingsPO.waitForLoad();
    await settingsPO.goToMembershipSettings();

    // Non subscription details displayed
    await utils.waitForNotVisible(settingsPO.nonSubscriptionDetails.loading);
    await utils.waitForVisible(settingsPO.nonSubscriptionDetails.status);
    expect(await utils.isElementDisplayed(settingsPO.nonSubscriptionDetails.status)).to.be.true;
    expect(await utils.isElementDisplayed(settingsPO.subscriptionDetails.status)).to.be.false;

    // Select a subscription
    await utils.clickElement(settingsPO.nonSubscriptionDetails.createSubscription);
    await utils.waitForNotVisible(signup.membershipSelectForm.loading);
    await signup.selectMembershipOption(invoiceOptionIds.monthly, false);
    await signup.goNext();

    // Add a payment method
    await utils.waitForNotVisible(paymentMethods.paymentMethodFormSelect.loading);
    expect((await paymentMethods.getPaymentMethods()).length).to.eql(0);
    await utils.clickElement(paymentMethods.paymentMethodAccordian.creditCard);
    await utils.waitForNotVisible(creditCard.creditCardForm.loading);
    await creditCard.fillInput("cardNumber", newVisa.number);
    await creditCard.fillInput("csv", newVisa.csv);
    await creditCard.fillInput("expirationDate", newVisa.expiration);
    await creditCard.fillInput("postalCode", newVisa.postalCode);
    await creditCard.fillInput("cardholderName", newVisa.name);
      await signup.goNext();
    await utils.waitForNotVisible(paymentMethods.paymentMethodAccordian.creditCard);

    // Select the payment method
    await utils.waitForNotVisible(paymentMethods.paymentMethodSelect.loading);
    await browser.waitUntil(async () => {
      const numPaymentMethods = (await paymentMethods.getPaymentMethods()).length;
      return numPaymentMethods === 1;
    }, undefined, "Payment methods table never reloaded");

    await signup.goNext();

    // Accept recurring payment authorization
    await utils.waitForVisible(checkoutPo.authAgreementCheckbox);
    await utils.clickElement(checkoutPo.authAgreementCheckbox);
    await signup.goNext();
    await utils.waitForPageToMatch(Routing.Profile);
    await header.navigateTo(header.links.logout);
    await utils.waitForVisible(header.loginLink);

    // Login as admin
    await auth.goToLogin();
    await auth.signInUser(getAdminUserLogin());
    await header.navigateTo(header.links.billing);
    await utils.waitForPageLoad(billingPO.url);
    await billingPO.goToSubscriptions();

    await utils.waitForNotVisible(subscriptionPO.getLoadingId(), 60 * 1000);

    // Find and cancel subscription
    const name = await subscriptionPO.getColumnTextByIndex(0, "memberName");
    await subscriptionPO.selectRowByIndex(0);
    await utils.clickElement(subscriptionPO.actionButtons.delete);
    await utils.waitForVisible(subscriptionPO.cancelSubscriptionModal.submit);
    await utils.waitForNotVisible(subscriptionPO.cancelSubscriptionModal.loading);
    await utils.clickElement(subscriptionPO.cancelSubscriptionModal.submit);
    await utils.waitForNotVisible(subscriptionPO.cancelSubscriptionModal.submit);
    await utils.waitForNotVisible(subscriptionPO.getLoadingId(), 60 * 1000);

    const rows = await subscriptionPO.getAllRows();
    await Promise.all(rows.map((row, index) => {
      return new Promise(async (resolve) => {
        const memberName = await subscriptionPO.getColumnByIndex(index, "memberName");
        expect(memberName).not.to.eql(name);
        resolve();
      });
    }));
  });
});