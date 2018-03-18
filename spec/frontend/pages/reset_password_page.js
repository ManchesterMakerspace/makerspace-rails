var ResetPasswordPage = function () {
  var emailInput = element(by.model("passwordCtrl.passwordForm.email"));
  var passwordInput = element(by.model("passwordCtrl.passwordForm.password"));
  var passwordConfirmationInput = element(by.model("passwordCtrl.passwordForm.password_confirmation"))
  var submitButton = element(by.css('button[type="submit"]'));
  var url = browser.baseUrl + 'resetPassword';
  this.get = function () {
    return browser.get(url);
  };
  this.getUrl = function () {
    return url;
  };

  this.getEmail = function () {
    return emailInput.getAttribute('value');
  };
  this.setEmail = function (email) {
    return emailInput.clear().sendKeys(email);
  };
  this.getPassword = function () {
    return passwordInput.getAttribute('value');
  };
  this.setPassword = function (password) {
    return passwordInput.clear().sendKeys(password);
  };
  this.getPasswordConfirmation = function () {
    return passwordConfirmationInput.getAttribute('value');
  };
  this.setPasswordConfirmation = function (password) {
    return passwordConfirmationInput.clear().sendKeys(password);
  };
  this.submit = function () {
    return submitButton.click();
  };
};

module.exports = ResetPasswordPage;
