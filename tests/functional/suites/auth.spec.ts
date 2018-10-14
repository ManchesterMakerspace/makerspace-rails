import { Routing } from "app/constants";
import { AuthPageObject } from "../pageObjects/auth";
import { PageUtils, rootURL } from "../pageObjects/common";
import { mockRequests, mock } from "../mockserver-client-helpers";
import { MemberPageObject } from "../pageObjects/member";
import { basicUser } from "../constants/member";
import { invoiceOptions, membershipOptionQueryParams } from "../constants/invoice";

const auth = new AuthPageObject();
const utils = new PageUtils();
const memberPO = new MemberPageObject();
const member = Object.assign({}, basicUser);
const memberId = member.id;
const profileUrl = memberPO.getProfileUrl(memberId);

describe("Authentication", () => {
  describe("Logging in", () => {
    beforeEach(() => {
      return browser.get(rootURL).then(() => {
        return auth.goToLogin();
      });
    });
    it("User can sign in and be directed to their profile", async () => {
      /* 1. Setup mocks
         - Sign in
         - Load Profile
         2. Go to login form
         3. Fill out and submit form
         4. Wait for login page to change
         5. Assert on profile page
      */
      await mock(mockRequests.signIn.ok({
        ...member,
        password: "password"
      }));
      await mock(mockRequests.member.get.ok(memberId, member));
      await auth.signInUser(member);
      await utils.waitForPageChange(utils.buildUrl(Routing.Login));
      const url = await browser.getCurrentUrl();
      expect(url).toEqual(utils.buildUrl(profileUrl));
    });
    it("User can automatically sign in with cookies", async () => {
      /* 1. Execute autoLogin util
         2. Wait for profile to load
      */
      await auth.autoLogin(member);
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
      */
      await utils.clickElement(auth.loginModal.submitButton);
      await utils.assertInputError(auth.loginModal.emailInput);
      await utils.assertInputError(auth.loginModal.passwordInput);
      await utils.fillInput(auth.loginModal.emailInput, "foo");
      await utils.assertNoInputError(auth.loginModal.emailInput);
      await utils.fillInput(auth.loginModal.passwordInput, "foobar");
      await utils.assertNoInputError(auth.loginModal.passwordInput);
      await utils.clickElement(auth.loginModal.submitButton);
      await utils.assertInputError(auth.loginModal.emailInput);
      await utils.fillInput(auth.loginModal.emailInput, "foo@bar.com");
      expect(await utils.isElementDisplayed(auth.loginModal.error)).toBeFalsy();
      await utils.clickElement(auth.loginModal.submitButton);
      expect(await utils.isElementDisplayed(auth.loginModal.error)).toBeTruthy();
    });
  });
  describe("Signing up", () => {
    beforeEach(() => browser.get(rootURL));

    it("User can sign up with a selected membership option", async () => {
      /* 1. Setup mocks
          - Load membership options
          - Sign up
          - Load profile
          - Load invoices
         2. Fill out and submit sign in form
         3. Wait for profile page to load
         4. Assert welcome modal displayed
         TODO
         5. Assert Invoice is staged for checkout
      */
      const membershipId = "foo";
      const membershipOption = invoiceOptions.find((io) => io.id === membershipId);
      await mock(mockRequests.invoiceOptions.get.ok([membershipOption], membershipOptionQueryParams));
      await mock(mockRequests.signUp.ok(member));
      await mock(mockRequests.member.get.ok(memberId, member));
      await browser.get(utils.buildUrl());
      expect(await utils.getElementAttribute(auth.signUpModal.membershipSelect, 'value')).toEqual(membershipId);
      await auth.signUpUser(member);
      await utils.waitForPageLoad(utils.buildUrl(profileUrl), true);
      expect(await utils.isElementDisplayed(memberPO.welcomeModal.id)).toBeTruthy();
    });
    it("User can sign up without a chosen membership option", async () => {
      /* 1. Setup mocks
          - Sign up
          - Load profile
          - Load invoices
         2. Fill out and submit sign in form
         3. Wait for profile page to load
         4. Assert welcome modal displayed
         TODO
         5. Assert Invoice is Listed as due in invoice list
      */
      await mock(mockRequests.signUp.ok(member));
      await mock(mockRequests.member.get.ok(memberId, member));
      await auth.signUpUser(member);
      await utils.waitForPageLoad(utils.buildUrl(profileUrl), true);
      expect(await utils.isElementDisplayed(memberPO.welcomeModal.id)).toBeTruthy();
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
    xit("Form validation", async () => {
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
    });
  });

  xdescribe("Resetting Password", () => {
    it("User can reset their password", async () => {
      /* 1. Setup mocks
          - Password reset request
          - Password reset submittal
         2. Fill out & submit form
         3. Verify reset email sent
         4. Click link in email
         5. Verify reset form opens
         6. Enter new password and submit
         7. Assert logged in and on profile page
      */
    });
    it("Form validation", async () => {
      /* 1. Submit form
         2. Verify email input error
         3. Input invalid email & submit
         4. Verify error
         5. Enter correct email & submit (no mock setup so request will fail)
         6. Verify form error
         7. Su
      */
    });
  });
});