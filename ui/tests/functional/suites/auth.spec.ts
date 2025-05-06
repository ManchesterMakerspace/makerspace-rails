import { expect } from "chai";
import { Routing } from "app/constants";
import auth, { LoginMember } from "@pageObjects/auth";
import utils from "@pageObjects/common";
import memberPO from "@pageObjects/member";
import { basicUser } from "@constants/member";
import { defaultBillingOptions as invoiceOptions, membershipOptionQueryParams } from "@constants/invoice";
import signup from "@pageObjects/signup";
import { loadMockserver } from "../mockserver";
import { autoLogin } from "../autoLogin";
import { defaultInvoice } from "../../constants/invoice";
import { Match } from "makerspace-ts-mock-client/dist/mockserver/matcher";
import { checkout } from "../../pageObjects/checkout";
import { paymentMethods, creditCard } from "../../pageObjects/paymentMethods";
import { defaultTransaction } from "../../constants/transaction";
import { generateClientToken, loadBraintreeMockserver, mockBraintreeTokenValidation } from "../../constants/braintreeMockserver";
import { newVisa } from "../../constants/paymentMethod";

const member = Object.assign({}, basicUser);
const memberId = member.id;
const profileUrl = memberPO.getProfilePath(memberId);
const mocker = loadMockserver();
loadBraintreeMockserver();

describe("Authentication", () => {
  afterEach(() => mocker.reset());

  describe("Logging in", () => {
    beforeEach(() => {
      return auth.goToLogin();
    });

    it("User can sign in and be directed to their profile", async () => {
      /* 1. Setup mocks
         - Sign in
         - Load Profile
         2. Go to login form
         3. Fill out and submit login form
         4. Wait for login page to change
         5. Assert on profile page
      */
      mocker.signIn_200({ body: { member: { email: member.email, password: member.password} } }, member);
      mocker.listMembersPermissions_200({ id: member.id }, {});
      mocker.getMember_200({ id: member.id }, member);
      await auth.signInUser(member);
      await utils.waitForPageLoad(memberPO.getProfilePath(member.id));
      const url = await browser.getUrl();
      expect(url).to.eql(utils.buildUrl(profileUrl));
    });
    it("User can automatically sign in with cookies", async () => {
      /* 1. Execute autoLogin util
         2. Wait for profile to load
      */
      await autoLogin(mocker, member);
      const url = await browser.getUrl();
      expect(url).to.eql(utils.buildUrl(profileUrl));
    });
    it("Form validation", async () => {
      /* 1. Submit login form
         2. Assert errors for email and password
         3. Fill email with invalid value. Fill password with valid value
         4. Assert errors disappear
         5. Submit form
         6. Assert errors again
         7. Fill inputs w/ valid values
         8. Submit form (no mock setup so request will fail)
         9. Assert form displays API error
         10. Mock & submit
         11. Wait for profile page
      */
      await utils.clickElement(auth.loginModal.submitButton);
      await utils.assertInputError(auth.loginModal.emailInput);
      await utils.assertInputError(auth.loginModal.passwordInput);
      await utils.fillInput(auth.loginModal.emailInput, "foo");
      await utils.assertNoInputError(auth.loginModal.emailInput);
      await utils.fillInput(auth.loginModal.passwordInput, member.password);
      await utils.assertNoInputError(auth.loginModal.passwordInput);
      await utils.clickElement(auth.loginModal.submitButton);
      await utils.assertInputError(auth.loginModal.emailInput);
      await utils.fillInput(auth.loginModal.emailInput, member.email);
      expect(await utils.isElementDisplayed(auth.loginModal.error)).to.be.false;
      await utils.clickElement(auth.loginModal.submitButton);
      expect(await utils.isElementDisplayed(auth.loginModal.error)).to.be.true;
      mocker.signIn_200({ body: { member: { email: member.email, password: member.password} } }, member);
      mocker.listMembersPermissions_200({ id: memberId }, {});
      mocker.getMember_200({ id: memberId }, member);
      await utils.clickElement(auth.loginModal.submitButton);
      await utils.waitForPageLoad(memberPO.getProfilePath(member.id));
    });
  });
  describe("Signing up", () => {
    const newMember: LoginMember = {
      ...member,
      memberContractOnFile: false,
    }

    beforeEach(() => {
      mocker.getNewPaymentMethod_200({
        clientToken: generateClientToken()
      }, { unlimited: true });
      mockBraintreeTokenValidation(newVisa);
    });
    it("User can sign up with a selected membership option", async function () {
      /* 1. Setup mocks
          - Load membership options
          - Sign up
          - Load profile
          - Load invoices
         2. Go to home page & select a membership option
         3. Verify directed to sign up form
         4. Fill out sign up form & submit
         5. Verify document pages & error fields
         6. Accept & sign both documents
         7. Verify directed to profile
      */

      const membershipId = "foo";
      mocker.listInvoiceOptions_200(membershipOptionQueryParams, invoiceOptions)
      const { firstname, lastname, email, password, address } = newMember;
      mocker.registerMember_200({ body: {
        firstname, lastname, email, password, address
      } }, newMember );
      mocker.listMembersPermissions_200({ id: newMember.id }, {});
      await browser.url(utils.buildUrl());
      await signup.selectMembershipOption(membershipId, true);
      await utils.waitForPageLoad(signup.signupUrl);
      await signup.signUpUser(newMember);

      await utils.waitForVisible(signup.documentsSigning.codeOfConductCheckbox);
      await utils.clickElement(signup.documentsSigning.codeOfConductCheckbox);
      await utils.waitForVisible(signup.documentsSigning.memberContractCheckbox);
      mocker.updateMember_200({ body: { signature: "foobar"}, id: newMember.id }, newMember, undefined, undefined, { body: Match.Ignore });
      mocker.listInvoices_200({}, [defaultInvoice]);
      await utils.clickElement(signup.documentsSigning.memberContractCheckbox);
      await signup.signContract();
      await signup.goNext();
      await utils.waitForVisible(signup.signUpControls.cartPreview);
      mocker.getMember_200({ id: newMember.id }, { ...newMember, memberContractOnFile: true });
      mocker.listPaymentMethods_200([]);
      await signup.goNext();
      await utils.waitForNotVisible(signup.signUpControls.cartPreview);
      await utils.waitForNotVisible(paymentMethods.paymentMethodFormSelect.loading);
      // Add a payment method
      await utils.waitForVisible(paymentMethods.paymentMethodAccordian.creditCard);
      expect((await paymentMethods.getPaymentMethods()).length).to.eql(0);
      await utils.clickElement(paymentMethods.paymentMethodAccordian.creditCard);
      await creditCard.fillInput("cardNumber", newVisa.number);
      await creditCard.fillInput("csv", newVisa.csv);
      await creditCard.fillInput("expirationDate", newVisa.expiration);
      await creditCard.fillInput("postalCode", newVisa.postalCode);
      await creditCard.fillInput("cardholderName", newVisa.name);
      mocker.createPaymentMethod_200({} as any, newVisa);
      mocker.listPaymentMethods_200([newVisa]);
      mocker.getPaymentMethod_200({ id: newVisa.id }, newVisa);
      await signup.goNext();
      await utils.waitForNotVisible(paymentMethods.paymentMethodAccordian.creditCard);
      await utils.waitForVisible(checkout.authAgreementCheckbox);
      await utils.clickElement(checkout.authAgreementCheckbox);
      // Submit payment

      mocker.createTransaction_200({
        body: {
          invoiceOptionId: membershipId,
          paymentMethodId: newVisa.id
        }
      }, defaultTransaction);
      await signup.goNext();
      await utils.waitForPageLoad(memberPO.getProfilePath(newMember.id));
      expect(await utils.isElementDisplayed(memberPO.memberDetail.notificationModal));
    });
    xit("User notified if they have an account with the attempted sign up email", async () => {
      /* 1. Setup mocks
          - Sign up with dupe email
          - Login
         2. Fill out and submit sign in form
         3. Assert email exists error & accept modal (go to login)
         4. Assert login page loaded
         5. Login successfully
      */
    });
    it("Form validation", async function () {
      /* 1. Submit form
         2. Assert errors for fields
         3. Fill email with invalid value. Fill other fields with valid values
         4. Assert errors disappear
         5. Submit form
         6. Assert email error
         7. Fill email with valid value
         8. Submit form (no mock setup so request will fail)
         9. Assert form displays API error
      */
      const membershipId = "none";
      const { firstname, lastname, email, password, address } = newMember;
      mocker.listInvoiceOptions_200(membershipOptionQueryParams, []);
      await browser.url(utils.buildUrl());
      await signup.selectMembershipOption(membershipId, true);
      await utils.waitForPageLoad(signup.signupUrl);
      const { emailInput, firstnameInput, passwordInput, lastnameInput, error } = signup.signUpForm;
      await signup.goNext();
      await utils.assertInputError(firstnameInput);
      await utils.assertInputError(lastnameInput);
      await utils.assertInputError(emailInput);
      await utils.assertInputError(passwordInput);
      await utils.fillInput(firstnameInput, newMember.firstname);
      await utils.fillInput(lastnameInput, newMember.lastname);
      await utils.fillInput(passwordInput, newMember.password);
      await utils.fillInput(emailInput, "foo");
      await utils.fillInput(signup.signUpForm.streetInput, address.street);
      await utils.fillInput(signup.signUpForm.cityInput, address.city);
      await utils.fillInput(signup.signUpForm.zipInput, address.postalCode);
      await utils.selectDropdownByValue(signup.signUpForm.stateSelect, address.state);
      await signup.goNext();
      await utils.assertNoInputError(firstnameInput);
      await utils.assertNoInputError(lastnameInput);
      expect(await utils.assertInputError(emailInput));
      await utils.assertNoInputError(passwordInput);
      await utils.fillInput(emailInput, newMember.email);
      await signup.goNext();
      expect(!!(await utils.getElementText(error))).to.be.true;
      mocker.registerMember_200({ body: {
        firstname, lastname, email, password, address
      } }, newMember);
      mocker.listMembersPermissions_200({ id: newMember.id }, {});
      await signup.goNext();

      // Signed up, code of conduct validation
      await utils.waitForVisible(signup.documentsSigning.codeOfConductCheckbox);
      await signup.goNext();
      await utils.assertInputError(signup.documentsSigning.codeOfConductCheckbox)
      await utils.clickElement(signup.documentsSigning.codeOfConductCheckbox);
      await utils.assertNoInputError(signup.documentsSigning.codeOfConductCheckbox)

      // Contract validation
      await utils.waitForVisible(signup.documentsSigning.memberContractCheckbox);
      await signup.goNext();
      await utils.assertInputError(signup.documentsSigning.memberContractCheckbox)
      await utils.clickElement(signup.documentsSigning.memberContractCheckbox);
      await utils.assertNoInputError(signup.documentsSigning.memberContractCheckbox)
      await signup.goNext();
      await utils.assertInputError(signup.documentsSigning.memberContractError, true)
      mocker.updateMember_200({ body: { signature: "foobar"}, id: newMember.id }, newMember, undefined, undefined, { body: Match.Ignore });
      mocker.getMember_200({ id: newMember.id }, { ...newMember, memberContractOnFile: true });
      await signup.signContract();
      await signup.goNext();
      await utils.waitForNotVisible(signup.documentsSigning.memberContractCheckbox);
      await signup.goNext();
      await utils.waitForPageLoad(memberPO.getProfilePath(newMember.id));
    });
  });

  describe("Resetting Password", () => {
    beforeEach(() => {
      return auth.goToLogin();
    })
    it("User can reset their password", async () => {
      /* 1. Setup mocks
          - Password reset request
          - Password reset submittal
          - Get Profile
         2. Go to login page
         3. Click 'Forgot My Password' Link
         4. Fill out form with email
         5. Verify reset email sent
         6. Click link in email
         7. Verify reset form opens
         8. Enter new password and submit
         9. Assert logged in and on profile page
      */
      mocker.requestPasswordReset_201({ body: { member: { email: basicUser.email }} });
      await utils.clickElement(auth.loginModal.forgotPasswordLink);
      expect(await utils.isElementDisplayed(auth.passwordResetRequestModal.submitButton)).to.be.true;
      await utils.fillInput(auth.passwordResetRequestModal.emailInput, basicUser.email);
      await utils.clickElement(auth.passwordResetRequestModal.submitButton);
      const emailLink = auth.passwordResetUrl.replace(Routing.PathPlaceholder.Resource, "token");
      await browser.url(utils.buildUrl(emailLink));
      expect(await utils.isElementDisplayed(auth.passwordResetModal.submitButton)).to.be.true;
      await utils.fillInput(auth.passwordResetModal.passwordInput, "new password");
      mocker.getMember_200({ id: basicUser.id }, basicUser);
      mocker.resetPassword_204({ body: { member: { resetPasswordToken: "token", password: "new password" }} });
      mocker.signIn_200({ body: {} }, member);
      mocker.listMembersPermissions_200({ id: member.id }, {});
      await utils.clickElement(auth.passwordResetModal.submitButton);
      await utils.waitForPageLoad(memberPO.getProfilePath(basicUser.id));
    });
    it("Form validation", async () => {
      /* 1. Go to login page
         2. Click 'Forgot My Password' Link
         3. Submit form
         4. Verify email input error
         3. Input invalid email & submit
         4. Verify error
         5. Enter correct email & submit (no mock setup so request will fail)
         6. Verify form error
         7. Mock & submit
         8. Click link in email
         9. Verify reset form opens & submit
         10. Assert password input has error
         11. Fix password & submit (no mock setup so request will fail)
         12. Verify form error
         13. Mock & submit
         14. Verify profile page loads
      */
      await utils.clickElement(auth.loginModal.forgotPasswordLink);
      expect(await utils.isElementDisplayed(auth.passwordResetRequestModal.submitButton)).to.be.true;
      await utils.clickElement(auth.passwordResetRequestModal.submitButton);
      await utils.assertInputError(auth.passwordResetRequestModal.emailInput)
      await utils.fillInput(auth.passwordResetRequestModal.emailInput, basicUser.email);
      await utils.assertNoInputError(auth.passwordResetRequestModal.emailInput);
      await utils.clickElement(auth.passwordResetRequestModal.submitButton);
      expect(!!(await utils.getElementText(auth.passwordResetRequestModal.error))).to.be.true;
      mocker.requestPasswordReset_201({ body: { member: { email: basicUser.email }}});
      await utils.clickElement(auth.passwordResetRequestModal.submitButton);
      const emailLink = auth.passwordResetUrl.replace(Routing.PathPlaceholder.Resource, "token");
      await browser.url(utils.buildUrl(emailLink));
      expect(await utils.isElementDisplayed(auth.passwordResetModal.submitButton)).to.be.true;
      await utils.clickElement(auth.passwordResetModal.submitButton);
      await utils.assertInputError(auth.passwordResetModal.passwordInput);
      await utils.fillInput(auth.passwordResetModal.passwordInput, "new password");
      await utils.assertNoInputError(auth.passwordResetModal.passwordInput)
      await utils.clickElement(auth.passwordResetModal.submitButton);
      expect(!!(await utils.getElementText(auth.passwordResetModal.error))).to.be.true;
      mocker.resetPassword_204({ body: { member: { resetPasswordToken: "token", password: "new password" }} });
      mocker.signIn_200({ body: {} }, member);
      mocker.listMembersPermissions_200({ id: member.id }, {});
      mocker.getMember_200({ id: basicUser.id }, basicUser);
      await utils.clickElement(auth.passwordResetModal.submitButton);
      await utils.waitForPageLoad(memberPO.getProfilePath(basicUser.id));
    });
  });
});