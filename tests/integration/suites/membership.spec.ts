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
import { getAdminUserLogin, getBasicUserLogin, creditCardNumbers, invoiceOptionIds } from "../../constants/api_seed_data";
import { By } from "selenium-webdriver";

const newVisa = {
  number: creditCardNumbers.visa,
  expiration: "022020",
  csv: "123",
  postalCode: "90210",
}

const newMastercard = {
  number: creditCardNumbers.mastercard,
  expiration: "022020",
  csv: "123",
  postalCode: "90210",
}

describe("Membership", () => {
  beforeEach(() => {
    return browser.get(utils.buildUrl());
  })

  test("Members can create a membership, change payment methods and cancel their membership", async () => {
    await auth.goToLogin();
    await auth.signInUser(getBasicUserLogin());
    await header.navigateTo(header.links.settings);
    await utils.waitForPageLoad(settingsPO.pageUrl);
    await settingsPO.goToMembershipSettings();

    // Non subscription details displayed
    await utils.waitForNotVisible(settingsPO.nonSubscriptionDetails.loading);
    expect(await utils.isElementDisplayed(settingsPO.nonSubscriptionDetails.status)).toBeTruthy();
    expect(await utils.isElementDisplayed(settingsPO.subscriptionDetails.status)).toBeFalsy();

    // Select a subscription
    await utils.clickElement(settingsPO.nonSubscriptionDetails.createSubscription);
    await utils.waitForNotVisible(signup.membershipSelectForm.loading);
    await signup.selectMembershipOption(invoiceOptionIds.monthly);
    await utils.clickElement(signup.membershipSelectForm.submit);
    await utils.waitForPageLoad(checkoutPo.checkoutUrl);

    // Add a payment method
    await utils.waitForNotVisible(paymentMethods.paymentMethodSelect.loading);
    expect((await paymentMethods.getPaymentMethods()).length).toEqual(0);
    await utils.clickElement(paymentMethods.addPaymentButton);
    await utils.waitForVisible(paymentMethods.paymentMethodFormSelect.creditCard);
    await utils.waitForNotVisible(paymentMethods.paymentMethodFormSelect.loading);
    await utils.clickElement(paymentMethods.paymentMethodFormSelect.creditCard);

    await utils.waitForVisible(creditCard.creditCardForm.submit);
    await utils.waitForNotVisible(creditCard.creditCardForm.loading);
    await creditCard.fillInput("cardNumber", newVisa.number);
    await creditCard.fillInput("csv", newVisa.csv);
    await creditCard.fillInput("expirationDate", newVisa.expiration);
    await creditCard.fillInput("postalCode", newVisa.postalCode);
    await utils.clickElement(creditCard.creditCardForm.submit);
    await utils.waitForNotVisible(creditCard.creditCardForm.loading);
    await utils.waitForNotVisible(creditCard.creditCardForm.submit);

    // Select the payment method
    // TODO: new payment methods should be auto selected
    await utils.waitForNotVisible(paymentMethods.paymentMethodSelect.loading);
    expect((await paymentMethods.getPaymentMethods()).length).toEqual(1);
    await paymentMethods.selectPaymentMethodByIndex(0);

    // Submit payment, view receipt & return to profile
    await utils.clickElement(checkoutPo.submit);
    await utils.waitForPageLoad(Routing.Receipt);
    await utils.clickElement(checkoutPo.backToProfileButton);
    await utils.waitForPageToMatch(Routing.Profile);
    // TODO: Verify subscription & receipt emails

    await header.navigateTo(header.links.settings);
    await utils.waitForPageLoad(settingsPO.pageUrl);
    await settingsPO.goToMembershipSettings();

    // Subscription details displayed
    await utils.waitForNotVisible(settingsPO.subscriptionDetails.loading);
    expect(await utils.isElementDisplayed(settingsPO.subscriptionDetails.status)).toBeTruthy();
    expect(await utils.isElementDisplayed(settingsPO.nonSubscriptionDetails.status)).toBeFalsy();
    // Change payment method
    await utils.clickElement(settingsPO.subscriptionDetails.changePaymentMethod);

    // Add a payment method
    await utils.waitForNotVisible(paymentMethods.paymentMethodSelect.loading);
    expect((await paymentMethods.getPaymentMethods()).length).toEqual(1);
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
    await utils.clickElement(creditCard.creditCardForm.submit);
    await utils.waitForNotVisible(creditCard.creditCardForm.loading);
    await utils.waitForNotVisible(creditCard.creditCardForm.submit);

    // Select the payment method
    // TODO: new payment methods should be auto selected
    await utils.waitForNotVisible(paymentMethods.paymentMethodSelect.loading);
    expect((await paymentMethods.getPaymentMethods()).length).toEqual(2);
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
    expect(await utils.isElementDisplayed(settingsPO.nonSubscriptionDetails.status)).toBeTruthy();
    expect(await utils.isElementDisplayed(settingsPO.subscriptionDetails.status)).toBeFalsy();
  }, 300000);

  test("Admins can cancel a membership", async () => {
    await auth.goToLogin();
    await auth.signInUser(getBasicUserLogin());
    await header.navigateTo(header.links.settings);
    await utils.waitForPageLoad(settingsPO.pageUrl);
    await settingsPO.goToMembershipSettings();

    // Non subscription details displayed
    await utils.waitForNotVisible(settingsPO.nonSubscriptionDetails.loading);
    expect(await utils.isElementDisplayed(settingsPO.nonSubscriptionDetails.status)).toBeTruthy();
    expect(await utils.isElementDisplayed(settingsPO.subscriptionDetails.status)).toBeFalsy();

    // Select a subscription
    await utils.clickElement(settingsPO.nonSubscriptionDetails.createSubscription);
    await utils.waitForNotVisible(signup.membershipSelectForm.loading);
    await signup.selectMembershipOption(invoiceOptionIds.monthly);
    await utils.clickElement(signup.membershipSelectForm.submit);
    await utils.waitForPageLoad(checkoutPo.checkoutUrl);

    // Add a payment method
    await utils.waitForNotVisible(paymentMethods.paymentMethodSelect.loading);
    expect((await paymentMethods.getPaymentMethods()).length).toEqual(0);
    await utils.clickElement(paymentMethods.addPaymentButton);
    await utils.waitForVisible(paymentMethods.paymentMethodFormSelect.creditCard);
    await utils.waitForNotVisible(paymentMethods.paymentMethodFormSelect.loading);
    await utils.clickElement(paymentMethods.paymentMethodFormSelect.creditCard);

    await utils.waitForVisible(creditCard.creditCardForm.submit);
    await utils.waitForNotVisible(creditCard.creditCardForm.loading);
    await creditCard.fillInput("cardNumber", newVisa.number);
    await creditCard.fillInput("csv", newVisa.csv);
    await creditCard.fillInput("expirationDate", newVisa.expiration);
    await creditCard.fillInput("postalCode", newVisa.postalCode);
    await utils.clickElement(creditCard.creditCardForm.submit);
    await utils.waitForNotVisible(creditCard.creditCardForm.loading);
    await utils.waitForNotVisible(creditCard.creditCardForm.submit);

    // Select the payment method
    // TODO: new payment methods should be auto selected
    await utils.waitForNotVisible(paymentMethods.paymentMethodSelect.loading);
    expect((await paymentMethods.getPaymentMethods()).length).toEqual(1);
    await paymentMethods.selectPaymentMethodByIndex(0);

    // Submit payment, view receipt & return to profile
    await utils.clickElement(checkoutPo.submit);
    await utils.waitForPageLoad(Routing.Receipt);
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

    // Make sure deleted one doesn't show up since list should filter cancelled
    const cancelledFilter = await browser.findElement(By.css(subscriptionPO.filters.hideCancelled));
    await utils.selectCheckbox(cancelledFilter);
    const rows = await subscriptionPO.getAllRows();
    rows.forEach(async (row, index) => { 
      expect(await subscriptionPO.getColumnByIndex(index, "memberName")).not.toEqual(name);
    });
  }, 300 * 1000);
});