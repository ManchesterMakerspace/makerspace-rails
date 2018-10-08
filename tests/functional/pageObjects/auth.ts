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
  };
  private passwordResetModal = {
    id: "#password-reset",
    passwordInput: "#reset-password-input",
  }

  public signInUser = async (user, error = false) => {
    await utils.fillInput(this.loginModal.emailInput, user.email);
    await utils.fillInput(this.loginModal.passwordInput, user.password);
    const signInFunc = error ? mockRequests.signIn.error : mockRequests.signIn.ok;
    await mock(signInFunc(user));
    await utils.clickElement(this.loginModal.submitButton);
  }
}