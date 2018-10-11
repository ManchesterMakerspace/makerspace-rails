import { PageUtils } from "./common";

const utils = new PageUtils();

export class AuthPageObject {
  private authToggleButton = "#auth-toggle";
  private emailExistsModal = "#email-exists";
  private signUpModal = {
    id: "#sign-up-modal",
    membershipSelect: "#sign-up-modal-membership-id",
    membershipOptions: "#sign-up-modal-{ID}",
    discountCheckbox: "#sign-up-modal-discount",
    firstnameInput: "#sign-up-modal-firstname",
    lastnameInput: "#sign-up-modal-lastname",
    emailInput: "#sign-up-modal-email",
    passwordInput: "#sign-up-modal-password",
    error: "#sign-up-modal-error",
  };
  private loginModal = {
    id: "#login-modal",
    emailInput: "#login-modal-email",
    passwordInput: "#login-modal-password",
    forgotPasswordLink: "#forgot-password",
    error: "#login-modal-error",
    submitButton: "#login-modal-submit"
  };
  private passwordResetModal = {
    id: "#password-reset",
    passwordInput: "#reset-password-input",
  }

  public goToLogin = async () => {
    await utils.clickElement(this.authToggleButton);
  }

  public signInUser = async (user: { email: string, password: string }) => {
    await utils.fillInput(this.loginModal.emailInput, user.email);
    await utils.fillInput(this.loginModal.passwordInput, user.password);
    await utils.clickElement(this.loginModal.submitButton);
  }
}