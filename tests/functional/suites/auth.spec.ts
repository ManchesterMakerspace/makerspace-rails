import { Routing } from "app/constants";
import auth, { LoginMember } from "../../pageObjects/auth";
import utils from "../../pageObjects/common";
import { mockRequests, mock } from "../mockserver-client-helpers";
import memberPO from "../../pageObjects/member";
import { basicUser } from "../../constants/member";
import { defaultBillingOptions as invoiceOptions, membershipOptionQueryParams } from "../../constants/invoice";
import signup from "../../pageObjects/signup";
import { autoLogin } from "../autoLogin";

const member = Object.assign({}, basicUser);
const memberId = member.id;
const profileUrl = memberPO.getProfilePath(memberId);

describe("Authentication", () => {
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
      await mock(mockRequests.signIn.ok(member));
      await mock(mockRequests.permission.get.ok(member.id, {}));
      await mock(mockRequests.member.get.ok(memberId, member));
      await auth.signInUser(member);
      await utils.waitForPageLoad(memberPO.getProfilePath(member.id));
      const url = await browser.getCurrentUrl();
      expect(url).toEqual(utils.buildUrl(profileUrl));
    });
    it("User can automatically sign in with cookies", async () => {
      /* 1. Execute autoLogin util
         2. Wait for profile to load
      */
      await autoLogin(member);
      const url = await browser.getCurrentUrl();
      expect(url).toEqual(utils.buildUrl(profileUrl));
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
      expect(await utils.isElementDisplayed(auth.loginModal.error)).toBeFalsy();
      await utils.clickElement(auth.loginModal.submitButton);
      expect(await utils.isElementDisplayed(auth.loginModal.error)).toBeTruthy();
      await mock(mockRequests.signIn.ok(member));
      await mock(mockRequests.permission.get.ok(member.id, {}));
      await mock(mockRequests.member.get.ok(memberId, member));
      await utils.clickElement(auth.loginModal.submitButton);
      await utils.waitForPageLoad(memberPO.getProfilePath(member.id));
    });
  });
  describe("Signing up", () => {
    const newMember: LoginMember = {
      ...member,
      memberContractOnFile: false,
    }
    it("User can sign up with a selected membership option", async () => {
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
         7. Verify directed to checkout form
         8. Verify no payment methods are available & selected membership option is in receipt area
         9. Add a CC payment method
         10. Submit form
         11. Verify directed to receipt page
         12. Click 'Go to My Profile' & verify directed to profile page
      */

      const membershipId = "foo";
      const membershipOption = invoiceOptions.find((io) => io.id === membershipId);
      await mock(mockRequests.invoiceOptions.get.ok([membershipOption], membershipOptionQueryParams));
      await mock(mockRequests.invoiceOptions.get.ok([membershipOption], membershipOptionQueryParams));
      await mock(mockRequests.signUp.ok(newMember)); // initial signup
      await mock(mockRequests.permission.get.ok(newMember.id, {}));
      await mock(mockRequests.invoices.post.ok(membershipOption, false)); // initial invoice creation
      await mock(mockRequests.member.get.ok(newMember.id, newMember)); // Profile load
      await browser.get(utils.buildUrl());
      await signup.selectMembershipOption(membershipId);
      await utils.waitForPageLoad(signup.signupUrl);
      await signup.signUpUser(newMember);

      await utils.waitForPageLoad(memberPO.getProfilePath(newMember.id));
      expect(await utils.isElementDisplayed(memberPO.memberDetail.notificationModal));
      await utils.clickElement(memberPO.memberDetail.notificationModalSubmit);

      await utils.waitForVisible(signup.documentsSigning.codeOfConductSubmit);
      await utils.clickElement(signup.documentsSigning.codeOfConductCheckbox);
      await utils.clickElement(signup.documentsSigning.codeOfConductSubmit);
      await utils.waitForVisible(signup.documentsSigning.memberContractCheckbox);
      await mock(mockRequests.member.put.ok(newMember.id, newMember)); // upload signature
      await mock(mockRequests.invoices.get.ok([membershipOption])); // Load selected invoice
      await utils.clickElement(signup.documentsSigning.memberContractCheckbox);
      await signup.signContract();
      await utils.clickElement(signup.documentsSigning.memberContractSubmit);
      await utils.waitForNotVisible(signup.documentsSigning.memberContractSubmit);
      await utils.waitForPageLoad(memberPO.getProfilePath(newMember.id));
    }, 200000);
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
    it("Form validation", async () => {
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
      const membershipId = "foo";
      const membershipOption = invoiceOptions.find((io) => io.id === membershipId);
      await mock(mockRequests.invoiceOptions.get.ok([membershipOption], membershipOptionQueryParams));
      await mock(mockRequests.invoiceOptions.get.ok([membershipOption], membershipOptionQueryParams));
      await browser.get(utils.buildUrl());
      await signup.selectMembershipOption(membershipId);
      await utils.waitForPageLoad(signup.signupUrl);
      const { emailInput, firstnameInput, passwordInput, lastnameInput, error, submitButton } = signup.signUpForm;
      await utils.clickElement(submitButton);
      await utils.assertInputError(firstnameInput);
      await utils.assertInputError(lastnameInput);
      await utils.assertInputError(emailInput);
      await utils.assertInputError(passwordInput);
      await utils.fillInput(firstnameInput, newMember.firstname);
      await utils.fillInput(lastnameInput, newMember.lastname);
      await utils.fillInput(passwordInput, newMember.password);
      await utils.fillInput(emailInput, "foo");
      await utils.clickElement(submitButton);
      await utils.assertNoInputError(firstnameInput);
      await utils.assertNoInputError(lastnameInput);
      expect(await utils.assertInputError(emailInput));
      await utils.assertNoInputError(passwordInput);
      await utils.fillInput(emailInput, newMember.email);
      await utils.clickElement(submitButton);
      expect(await utils.getElementText(error)).toBeTruthy();
      await mock(mockRequests.signUp.ok(newMember));
      await mock(mockRequests.permission.get.ok(newMember.id, {}));
      await mock(mockRequests.member.get.ok(newMember.id, newMember));
      await utils.clickElement(submitButton);

      await utils.waitForPageLoad(memberPO.getProfilePath(newMember.id));
      expect(utils.isElementDisplayed(memberPO.memberDetail.notificationModal));
      await utils.clickElement(memberPO.memberDetail.notificationModalSubmit);

      // Signed up, code of conduct validation
      await utils.waitForVisible(signup.documentsSigning.codeOfConductSubmit);
      await utils.clickElement(signup.documentsSigning.codeOfConductSubmit);
      await utils.assertInputError(signup.documentsSigning.codeOfConductCheckbox)
      await utils.clickElement(signup.documentsSigning.codeOfConductCheckbox);
      await utils.assertNoInputError(signup.documentsSigning.codeOfConductCheckbox)
      await utils.clickElement(signup.documentsSigning.codeOfConductSubmit);

      // Contract validation
      await utils.waitForVisible(signup.documentsSigning.memberContractCheckbox);
      await utils.clickElement(signup.documentsSigning.memberContractSubmit);
      await utils.assertInputError(signup.documentsSigning.memberContractCheckbox)
      await utils.clickElement(signup.documentsSigning.memberContractCheckbox);
      await utils.assertNoInputError(signup.documentsSigning.memberContractCheckbox)
      await utils.clickElement(signup.documentsSigning.memberContractSubmit);
      await utils.assertInputError(signup.documentsSigning.memberContractError, true)
      await mock(mockRequests.member.put.ok(newMember.id, newMember)); // upload signature
      await signup.signContract();
      await utils.clickElement(signup.documentsSigning.memberContractSubmit);
      await utils.waitForNotVisible(signup.documentsSigning.memberContractSubmit);
    }, 200000);
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
      await mock(mockRequests.passwordReset.requestReset.ok(basicUser.email));
      await utils.clickElement(auth.loginModal.forgotPasswordLink);
      expect(await utils.isElementDisplayed(auth.passwordResetRequestModal.submitButton)).toBeTruthy();
      await utils.fillInput(auth.passwordResetRequestModal.emailInput, basicUser.email);
      await utils.clickElement(auth.passwordResetRequestModal.submitButton);
      const emailLink = auth.passwordResetUrl.replace(Routing.PathPlaceholder.Resource, "token");
      await browser.get(utils.buildUrl(emailLink));
      expect(await utils.isElementDisplayed(auth.passwordResetModal.submitButton)).toBeTruthy();
      await utils.fillInput(auth.passwordResetModal.passwordInput, "new password");
      await mock(mockRequests.member.get.ok(basicUser.id, basicUser));
      await mock(mockRequests.passwordReset.updatePassword.ok("token", "new password"));
      await mock(mockRequests.signIn.ok(member));
      await mock(mockRequests.permission.get.ok(member.id, {}));
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
      expect(await utils.isElementDisplayed(auth.passwordResetRequestModal.submitButton)).toBeTruthy();
      await utils.clickElement(auth.passwordResetRequestModal.submitButton);
      expect(await utils.assertInputError(auth.passwordResetRequestModal.emailInput));
      await utils.fillInput(auth.passwordResetRequestModal.emailInput, basicUser.email);
      expect(await utils.assertNoInputError(auth.passwordResetRequestModal.emailInput));
      await utils.clickElement(auth.passwordResetRequestModal.submitButton);
      expect(await utils.getElementText(auth.passwordResetRequestModal.error)).toBeTruthy();
      await mock(mockRequests.passwordReset.requestReset.ok(basicUser.email));
      await utils.clickElement(auth.passwordResetRequestModal.submitButton);
      const emailLink = auth.passwordResetUrl.replace(Routing.PathPlaceholder.Resource, "token");
      await browser.get(utils.buildUrl(emailLink));
      expect(await utils.isElementDisplayed(auth.passwordResetModal.submitButton)).toBeTruthy();
      await utils.clickElement(auth.passwordResetModal.submitButton);
      expect(await utils.assertInputError(auth.passwordResetModal.passwordInput));
      await utils.fillInput(auth.passwordResetModal.passwordInput, "new password");
      expect(await utils.assertNoInputError(auth.passwordResetModal.passwordInput));
      await utils.clickElement(auth.passwordResetModal.submitButton);
      expect(await utils.getElementText(auth.passwordResetModal.error)).toBeTruthy();
      await mock(mockRequests.passwordReset.updatePassword.ok("token", "new password"));
      await mock(mockRequests.signIn.ok(member));
      await mock(mockRequests.permission.get.ok(member.id, {}));
      await mock(mockRequests.member.get.ok(basicUser.id, basicUser));
      await utils.clickElement(auth.passwordResetModal.submitButton);
      await utils.waitForPageLoad(memberPO.getProfilePath(basicUser.id));
    });
  });
});