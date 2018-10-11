import { Routing } from "app/constants";
import { MemberRole } from "app/entities/member";
import { AuthPageObject } from "../pageObjects/auth";
import { PageUtils } from "../pageObjects/common";
import { mockRequests, mock } from "../mockserver-client-helpers";

const auth = new AuthPageObject();
const utils = new PageUtils();

const memberId = "test_member"
const member = {
  id: memberId,
  firstname: "Test",
  lastname: "Member",
  email: "test_member@test.com",
  password: "password",
  role: [MemberRole.Member]
}
const profileUrl = Routing.Profile.replace(Routing.PathPlaceholder.MemberId, memberId);

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
         2. Wait for login page to change
         3. Assert on profile page
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

  xdescribe("Signing up", () => {
    it("User can sign up with a selected membership option", async () => {

    });
    it("User can sign up without a chosen membership option", async () => {

    });
    it("User notified if they have an account with the attempted sign up email", async () => {

    });
    it("Form validation", async () => {

    });
  });

  xdescribe("Resetting Password", () => {
    it("User can reset their password", async () => {

    });
    it("Form validation", async () => {

    });
  });
});