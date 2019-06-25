import * as moment from "moment";
import auth from "../../pageObjects/auth";
import utils from "../../pageObjects/common";
import memberPO from "../../pageObjects/member";
import { basicMembers } from "../../constants/member";
import header from "../../pageObjects/header";
import memberPo from "../../pageObjects/member";
import renewalPO from "../../pageObjects/renewalForm";
import invoicePO from "../../pageObjects/invoice";
import { checkout } from "../../pageObjects/checkout";
import { Routing } from "app/constants";
import { getAdminUserLogin, createRejectCard, creditCardNumbers } from "../../constants/api_seed_data";
import { selfRegisterMember } from "../utils/auth";
import { paymentMethods, creditCard } from "../../pageObjects/paymentMethods";

const newVisa = {
  number: creditCardNumbers.visa,
  expiration: "022020",
  csv: "123",
  postalCode: "90210",
}

describe("Member management", () => {
  describe("Registering", () => {
    beforeEach(() => {
      return browser.get(utils.buildUrl());
    });
    // TODO customers should be able to skip picking a membership type (PayPal/ cash payments)
    test("Customers can register from home page", async () => {
      const newMember = Object.assign({}, basicMembers.pop());
      await selfRegisterMember(newMember);
      await memberPO.verifyProfileInfo({
        ...newMember,
        expirationTime: null
      });
      // TODO: pay for selected membership
      await utils.clickElement(invoicePO.actionButtons.payNow);
      await utils.waitForPageLoad(checkout.checkoutUrl);

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
      await utils.clickElement(checkout.submit);
      await utils.waitForPageLoad(Routing.Receipt);
      await utils.clickElement(checkout.backToProfileButton);
      await utils.waitForPageToMatch(Routing.Profile);
      // TODO: Verify new member, subscription & receipt emails
    });
  
    test("Admins can register a customer manually", async () => {
      const newMember = Object.assign({}, basicMembers.pop());
      const cardId = "1819234";

      await auth.goToLogin();
      await auth.signInUser(getAdminUserLogin());
      await header.navigateTo(header.links.members);
      await utils.waitForPageLoad(memberPo.membersListUrl);
      await utils.waitForVisible(memberPo.membersList.createMemberButton);
      await utils.clickElement(memberPo.membersList.createMemberButton);
      await utils.waitForVisible(memberPo.memberForm.submit);
      await utils.clickElement(memberPo.memberForm.contract);
      await utils.fillInput(memberPo.memberForm.firstname, newMember.firstname);
      await utils.fillInput(memberPo.memberForm.lastname, newMember.lastname);
      await utils.fillInput(memberPo.memberForm.email, newMember.email);
      await utils.clickElement(memberPo.memberForm.submit);
      await utils.waitForNotVisible(memberPo.memberForm.submit);
      await utils.waitForPageToMatch(Routing.Profile);
      await memberPO.verifyProfileInfo({
        ...newMember,
        expirationTime: null
      });
       // Renew them for a month
       await utils.clickElement(memberPO.memberDetail.openRenewButton);
       await utils.waitForVisible(renewalPO.renewalForm.submit);
       expect(await utils.getElementText(renewalPO.renewalForm.entity)).toEqual(`${newMember.firstname} ${newMember.lastname}`);
       await utils.selectDropdownByValue(renewalPO.renewalForm.renewalSelect, "1");
       await utils.assertNoInputError(renewalPO.renewalForm.termError, true);
       await utils.clickElement(renewalPO.renewalForm.submit);
       await utils.waitForNotVisible(renewalPO.renewalForm.submit);
      // Get them a fob
      expect(await utils.getElementText(memberPO.memberDetail.openCardButton)).toMatch(/Register Fob/i);
      await utils.clickElement(memberPO.memberDetail.openCardButton);
      await utils.waitForVisible(memberPO.accessCardForm.submit);
      await createRejectCard(cardId);
      await utils.clickElement(memberPO.accessCardForm.importButton);
      await utils.waitForNotVisible(memberPO.accessCardForm.loading);
      expect(await utils.getElementText(memberPO.accessCardForm.importConfirmation)).toEqual(cardId);
      await utils.clickElement(memberPO.accessCardForm.submit);
      expect(await utils.isElementDisplayed(memberPo.accessCardForm.error)).toBeFalsy();
      await utils.waitForNotVisible(memberPO.accessCardForm.submit);
      await memberPO.verifyProfileInfo({
        ...newMember,
        expirationTime: moment().add(1, 'M').valueOf()
      });
    });
  });
});
