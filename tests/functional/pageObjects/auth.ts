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
  expirationTime: any;
}

export class AuthPageObject {
  public loginUrl = Routing.Login;
  public redirectUrl = Routing.Profile;
  public passwordResetUrl = `${Routing.PasswordReset}/${Routing.PathPlaceholder.Resource}`

  public authToggleButton = "#auth-toggle";
  public emailExistsModal = "#email-exists";

  private loginFormId = "#login-modal";
  public loginModal = {
    id: this.loginFormId,
    emailInput: `${this.loginFormId}-email`,
    passwordInput: `${this.loginFormId}-password`,
    forgotPasswordLink: `${this.loginFormId}word`,
    error: `${this.loginFormId}-error`,
    submitButton: `${this.loginFormId}-submit`,
  };

  private passwordResetModalId = "#password-reset";
  public passwordResetModal = {
    id: this.passwordResetModalId,
    passwordInput:`${this.passwordResetModalId}-input`,
    error: `${this.passwordResetModalId}-error`,
    submitButton: `${this.passwordResetModalId}-submit`,
  };
  private passwordResetRequestModalId = "#request-password-reset";
  public passwordResetRequestModal = {
    id: this.passwordResetRequestModalId,
    emailInput: `${this.passwordResetRequestModalId}-email`,
    error: `${this.passwordResetRequestModalId}-error`,
    submitButton: `${this.passwordResetRequestModalId}-submit`,
  }

  /*
  * Application tries to sign in the current user using cookies
  * This fakes that iniital request to automatically sign in the user
  * and skips the landing page
  */
  public autoLogin = async (user: LoginMember, destination?: string) => {
    const profileUrl = memberPO.getProfilePath(user.id);
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
    await browser.get(this.loginUrl);
  }

  public signInUser = async (user: { email: string, password: string }) => {
    await utils.fillInput(this.loginModal.emailInput, user.email);
    await utils.fillInput(this.loginModal.passwordInput, user.password);
    await utils.clickElement(this.loginModal.submitButton);
  }
}

export default new AuthPageObject();