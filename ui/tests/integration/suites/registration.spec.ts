import { expect } from "chai";
import moment from "moment";
import { Routing } from "app/constants";
import {
  invoiceOptionParam,
  defaultPlanId,
  discountParam
} from "pages/registration/MembershipOptions/constants";
import { createRejectCard, getAdminUserLogin } from "../../constants/api_seed_data";
import { basicMembers } from "../../constants/member";
import auth from "../../pageObjects/auth";
import utils from "../../pageObjects/common";
import memberPO from "../../pageObjects/member";
import header from "../../pageObjects/header";
import renewalPO from "../../pageObjects/renewalForm";
import signup from "../../pageObjects/signup";
import invoicePO from "../../pageObjects/invoice";
import { checkout } from "../../pageObjects/checkout";
import { paymentMethods, creditCard } from "../../pageObjects/paymentMethods";
import { selfRegisterMember } from "../utils/auth";
import { newVisa } from "../../constants/paymentMethod";

describe("Member management", () => {
  describe("Registering", () => {
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

    it("Customers can register from home page", async function () {
      this.timeout(200 * 1000);
      const rejectionUid = "register-home-page";
      await createRejectCard(rejectionUid);

      const newMember = Object.assign({}, basicMembers.pop());
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
      const url = await browser.getUrl();

      // Verify no expiration set from user POV
      await memberPO.verifyProfileInfo({
        ...newMember,
        expirationTime: undefined
      });

      // TODO: Verify new member, subscription & receipt emails

      // Logout
      await header.navigateTo(header.links.logout);
      await utils.waitForVisible(header.loginLink);

      // Login as Admin
      await auth.goToLogin();
      await auth.signInUser(getAdminUserLogin());
      await utils.waitForPageToMatch(Routing.Profile);

      // View new member's profile
      await browser.url(url);
      await utils.waitForPageToMatch(Routing.Profile);

      // Verify no expiration set from admin POV
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
      expect(await utils.isElementDisplayed(memberPO.accessCardForm.error)).to.be.false;
      await utils.waitForNotVisible(memberPO.accessCardForm.submit);
      await utils.waitForNotVisible(memberPO.memberDetail.loading);

      await memberPO.verifyProfileInfo({ // Verify registering card activates the membership
        ...newMember,
        expirationTime: moment().add(1, 'M').valueOf()
      });
    });

    it("Customers can register from home page via URL with discounts", async function () {
      this.timeout(200 * 1000);
      const discount = "SUNRISE-MONTH-50";
      await browser.url(utils.buildUrl(
        signup.signupUrl + `?${invoiceOptionParam}=one-month&${discountParam}=${discount}`));

      const rejectionUid = "register-home-page-with-discount";
      await createRejectCard(rejectionUid);

      const newMember = Object.assign({}, basicMembers.pop());
      await utils.waitForNotVisible(signup.membershipSelectForm.loading);

      await utils.waitForPageLoad(signup.signupUrl);
      await signup.signUpUser(newMember);

      await utils.waitForVisible(signup.documentsSigning.codeOfConductCheckbox);
      await utils.clickElement(signup.documentsSigning.codeOfConductCheckbox);
      await utils.waitForVisible(signup.documentsSigning.memberContractCheckbox);
      await utils.clickElement(signup.documentsSigning.memberContractCheckbox);
      await signup.signContract();
      // Go to Membership Select
      await signup.goNext();
      await utils.waitForVisible(signup.signUpControls.cartPreview);
      await signup.verifyDiscountId(discount);
      await signup.verifySelectedMembershipOption("one-month");

      // Just continue on as they are selected from URL
      await signup.goNext();
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

      await signup.verifyReviewStep(
        "65.00",
        discount,
        "32.50"
      );

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
      const url = await browser.getUrl();

      // Verify no expiration set from user POV
      await memberPO.verifyProfileInfo({
        ...newMember,
        expirationTime: undefined
      });

      // TODO: Verify new member, subscription & receipt emails

      // Logout
      await header.navigateTo(header.links.logout);
      await utils.waitForVisible(header.loginLink);

      // Login as Admin
      await auth.goToLogin();
      await auth.signInUser(getAdminUserLogin());
      await utils.waitForPageToMatch(Routing.Profile);

      // View new member's profile
      await browser.url(url);
      await utils.waitForPageToMatch(Routing.Profile);

      // Verify no expiration set from admin POV
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
      expect(await utils.isElementDisplayed(memberPO.accessCardForm.error)).to.be.false;
      await utils.waitForNotVisible(memberPO.accessCardForm.submit);
      await utils.waitForNotVisible(memberPO.memberDetail.loading);

      await memberPO.verifyProfileInfo({ // Verify registering card activates the membership
        ...newMember,
        expirationTime: moment().add(1, 'M').valueOf()
      });
    });

    it("Admins can register a customer manually", async () => {
      const newMember = Object.assign({}, basicMembers.pop());
      const rejectionUid = "admin-register-home-page";
      await createRejectCard(rejectionUid);

      await auth.goToLogin();
      await auth.signInUser(getAdminUserLogin());
      await header.navigateTo(header.links.members);
      await utils.waitForPageLoad(memberPO.membersListUrl);
      await utils.waitForVisible(memberPO.membersList.createMemberButton);
      await utils.clickElement(memberPO.membersList.createMemberButton);
      await utils.waitForVisible(memberPO.memberForm.submit);
      await utils.clickElement(memberPO.memberForm.contract);
      await utils.fillInput(memberPO.memberForm.firstname, newMember.firstname);
      await utils.fillInput(memberPO.memberForm.lastname, newMember.lastname);
      await utils.fillInput(memberPO.memberForm.street, "12 Main St.");
      await utils.fillInput(memberPO.memberForm.city, "Roswell");
      await utils.fillInput(memberPO.memberForm.zip, "90210");
      await utils.selectDropdownByValue(memberPO.memberForm.state, "GA");
      await utils.fillInput(memberPO.memberForm.email, newMember.email);
      await utils.fillInput(memberPO.memberForm.notes, "Some notes could be put in here");
      await utils.clickElement(memberPO.memberForm.submit);
      await utils.waitForNotVisible(memberPO.memberForm.submit);
      await utils.waitForPageToMatch(Routing.Profile);
      await memberPO.verifyProfileInfo({
        ...newMember,
        expirationTime: null
      });
       // Renew them for a month
       await utils.clickElement(memberPO.memberDetail.openRenewButton);
       await utils.waitForVisible(renewalPO.renewalForm.submit);
       expect(await utils.getElementText(renewalPO.renewalForm.entity)).to.eql(`${newMember.firstname} ${newMember.lastname}`);
       await utils.selectDropdownByValue(renewalPO.renewalForm.renewalSelect, "1");
       await utils.assertNoInputError(renewalPO.renewalForm.termError, true);
       await utils.clickElement(renewalPO.renewalForm.submit);
       await utils.waitForNotVisible(renewalPO.renewalForm.submit);
      // Get them a fob
      expect(await utils.getElementText(memberPO.memberDetail.openCardButton)).to.match(/Register Fob/i);
      await memberPO.openCardModal();
      await utils.waitForVisible(memberPO.accessCardForm.submit);
      await utils.waitForNotVisible(memberPO.accessCardForm.loading);

      await utils.clickElement(memberPO.accessCardForm.idVerification);
      await utils.waitForVisible(memberPO.accessCardForm.submit);
      await utils.clickElement(memberPO.accessCardForm.importButton);
      await utils.waitForNotVisible(memberPO.accessCardForm.loading);

      await browser.waitUntil(async () => {
        const loadedCard = await utils.getElementText(memberPO.accessCardForm.importConfirmation);
        return rejectionUid === loadedCard;
      }, undefined, `Received rejection card ${await utils.getElementText(memberPO.accessCardForm.importConfirmation)}, expected ${rejectionUid}`);
      await utils.clickElement(memberPO.accessCardForm.submit);
      expect(await utils.isElementDisplayed(memberPO.accessCardForm.error)).to.be.false;
      await utils.waitForNotVisible(memberPO.accessCardForm.submit);
      await memberPO.verifyProfileInfo({
        ...newMember,
        expirationTime: moment().add(1, 'M').valueOf()
      });
    });
  });
});
