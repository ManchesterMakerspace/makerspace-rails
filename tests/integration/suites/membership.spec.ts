import * as moment from "moment";
import auth, { LoginMember } from "../../pageObjects/auth";
import utils from "../../pageObjects/common";
import memberPO from "../../pageObjects/member";
import { basicMembers } from "../../constants/member";
import signup from "../../pageObjects/signup";
import header from "../../pageObjects/header";
import memberPo from "../../pageObjects/member";
import { checkout as checkoutPo } from "../../pageObjects/checkout";
import settingsPO from "../../pageObjects/settings";
import { paymentMethods, creditCard } from "../../pageObjects/paymentMethods";
import { Routing } from "app/constants";
import { getAdminUserLogin, createRejectCard, getBasicUserLogin } from "../../constants/api_seed_data";
import { selfRegisterMember } from "../utils/auth";

const newCreditCard = {
  number: "4111111111111111",
  expiration: "022020",
  csv: "123",
  postalCode: "90210",
}

xdescribe("Membership", () => {
  beforeEach(() => {
    return browser.get(utils.buildUrl());
  })

  test("Members can create a membership, change payment methods and cancel their membership", async () => {
    await auth.goToLogin();
    await auth.signInUser(getBasicUserLogin());
    await header.navigateTo(header.links.settings);
    await utils.waitForPageLoad(settingsPO.pageUrl);
    await settingsPO.goToMembershipSettings();

    await utils.clickElement(settingsPO.nonSubscriptionDetails.createSubscription);
    await utils.waitForNotVisible(signup.membershipSelectForm.loading);
    await signup.selectMembershipOption("one-month");
    await utils.clickElement(signup.membershipSelectForm.submit);

    await utils.waitForPageLoad(checkoutPo.checkoutUrl);
    await utils.waitForNotVisible(paymentMethods.paymentMethodSelect.loading);
    expect((await paymentMethods.getPaymentMethods()).length).toEqual(0);
    await utils.clickElement(paymentMethods.addPaymentButton);

    await utils.waitForNotVisible(paymentMethods.paymentMethodFormSelect.loading);
    await utils.clickElement(paymentMethods.paymentMethodFormSelect.creditCard);

    await utils.waitForNotVisible(creditCard.creditCardForm.loading);
    await utils.fillInput(creditCard.creditCardForm.cardNumber, newCreditCard.number);
    await utils.fillInput(creditCard.creditCardForm.csv, newCreditCard.csv);
    await utils.fillInput(creditCard.creditCardForm.expirationDate, newCreditCard.expiration);
    await utils.fillInput(creditCard.creditCardForm.postalCode, newCreditCard.postalCode);
    await utils.clickElement(creditCard.creditCardForm.submit);
    await utils.waitForNotVisible(creditCard.creditCardForm.loading);
    await utils.waitForNotVisible(creditCard.creditCardForm.submit);

    await utils.waitForNotVisible(paymentMethods.paymentMethodSelect.loading);
    expect((await paymentMethods.getPaymentMethods()).length).toEqual(1);
    await paymentMethods.selectPaymentMethodByIndex(0);

    await utils.clickElement(checkoutPo.submit);
    await utils.waitForPageLoad(Routing.Receipt);
    await utils.clickElement(checkoutPo.backToProfileButton);
    await utils.waitForPageToMatch(Routing.Profile);
  });

  test("Admins can cancel a membership", () => {

  });
});