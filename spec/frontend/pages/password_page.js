var PasswordPage = function () {
  var emailInput = element(by.model("passwordCtrl.passwordForm.email"));
  var passwordInput = element(by.model("passwordCtrl.passwordForm.password"));
  var passwordConfirmationInput = element(by.model("passwordCtrl.passwordForm.password_confirmation"));
  var submitButton = element(by.css('button[type="submit"]'));
  var page = this;

  var url = browser.baseUrl + 'resetPassword';
  this.get = function () {
    return browser.get(url);
  };
  this.getUrl = function () {
    return url;
  };

  this.emailValid = function () {
    return protractor.pageHelper.inputValid(emailInput);
  };
  this.passwordValid = function () {
    return protractor.pageHelper.inputValid(passwordInput);
  };
  this.getEmail = function () {
    return emailInput.getAttribute('value');
  };
  this.setEmail = function (email) {
    return emailInput.clear().sendKeys(email).sendKeys(protractor.Key.TAB);
  };
  this.getPassword = function () {
    return passwordInput.getAttribute('value');
  };
  this.setPassword = function (password) {
    return passwordInput.clear().sendKeys(password).sendKeys(protractor.Key.TAB);
  };
  this.setPasswordConfirmation = function (password) {
    return passwordConfirmationInput.clear().sendKeys(password).sendKeys(protractor.Key.TAB);
  };
  this.submit = function () {
    return submitButton.click();
  };
  this.toggleForgotPassword = function () {
    return resetLink.click();
  };
};

module.exports = PasswordPage;
