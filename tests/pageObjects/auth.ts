import { Routing } from "app/constants";
import { MemberDetails } from "app/entities/member";
import utils from "./common";

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
    forgotPasswordLink: `#forgot-password`,
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



  public goToLogin = async () => {
    await browser.get(utils.buildUrl(this.loginUrl));
    await utils.waitForPageLoad(Routing.Login);
  }

  public signInUser = async (user: { email: string, password: string }) => {
    await utils.fillInput(this.loginModal.emailInput, user.email);
    await utils.fillInput(this.loginModal.passwordInput, user.password);
    await utils.clickElement(this.loginModal.submitButton);
  }
}

export default new AuthPageObject();