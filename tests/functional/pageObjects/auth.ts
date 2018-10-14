import { Routing } from "app/constants";
import { MemberDetails } from "app/entities/member";
import { PageUtils, rootURL } from "./common";
import { mock, mockRequests } from "../mockserver-client-helpers";
import { MemberPageObject } from "../pageObjects/member";

const utils = new PageUtils();
const memberPO = new MemberPageObject();

export interface LoginMember extends Partial<MemberDetails> {
  email: string;
  password: string;
}

export class AuthPageObject {
  public redirectUrl = Routing.Profile;

  public authToggleButton = "#auth-toggle";
  public emailExistsModal = "#email-exists";
  public signUpModal = {
    id: "#sign-up-modal",
    membershipSelect: "#sign-up-modal-membership-id",
    membershipOptions: "#sign-up-modal-{ID}",
    discountCheckbox: "#sign-up-modal-discount",
    firstnameInput: "#sign-up-modal-firstname",
    lastnameInput: "#sign-up-modal-lastname",
    emailInput: "#sign-up-modal-email",
    passwordInput: "#sign-up-modal-password",
    submitButton: "#sign-up-modal-submit",
    error: "#sign-up-modal-error",
  };
  public loginModal = {
    id: "#login-modal",
    emailInput: "#login-modal-email",
    passwordInput: "#login-modal-password",
    forgotPasswordLink: "#forgot-password",
    error: "#login-modal-error",
    submitButton: "#login-modal-submit"
  };
  public passwordResetModal = {
    id: "#password-reset",
    passwordInput: "#reset-password-input",
  }

  /*
  * Application tries to sign in the current user using cookies
  * This fakes that iniital request to automatically sign in the user
  * and skips the landing page
  */
  public autoLogin = async (user: LoginMember, destination?: string) => {
    const profileUrl = memberPO.getProfileUrl(user.id);
    const destinationUrl = destination || profileUrl;
    await mock(mockRequests.signIn.ok(user));
    // If no destination, mock default member profile redirect
    if (!destination) {
      await mock(mockRequests.member.get.ok(user.id, user));
    }
    const fullUrl = utils.buildUrl(destinationUrl);
    return browser.get(fullUrl).then(() => {
      return utils.waitForPageLoad(fullUrl, true);
    })
  }

  public goToLogin = async () => {
    await utils.clickElement(this.authToggleButton);
  }

  public signInUser = async (user: { email: string, password: string }) => {
    await utils.fillInput(this.loginModal.emailInput, user.email);
    await utils.fillInput(this.loginModal.passwordInput, user.password);
    await utils.clickElement(this.loginModal.submitButton);
  }

  public signUpUser = async (user: Partial<LoginMember>) => {
    await utils.fillInput(this.signUpModal.firstnameInput, user.firstname);
    await utils.fillInput(this.signUpModal.lastnameInput, user.lastname);
    await utils.fillInput(this.signUpModal.emailInput, user.email);
    await utils.fillInput(this.signUpModal.passwordInput, user.password);
    await utils.clickElement(this.signUpModal.submitButton);
  }
}