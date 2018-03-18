var LoginPage = function () {
  var emailInput = element(by.model("loginCtrl.loginForm.email"));
  var passwordInput = element(by.model("loginCtrl.loginForm.password"));
  var submitButton = element(by.cssContainingText('button[type="submit"]', 'Sign in'));
  var resetLink = element(by.css('button[ng-click="loginCtrl.resetPassword()"]'));
  var page = this;

  var url = browser.baseUrl + 'login';
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
    return emailInput.clear().sendKeys(email);
  };
  this.getPassword = function () {
    return passwordInput.getAttribute('value');
  };
  this.setPassword = function (password) {
    return passwordInput.clear().sendKeys(password);
  };
  this.submitLogin = function () {
    return submitButton.click();
  };
  this.toggleForgotPassword = function () {
    return resetLink.click();
  };
  this.completeForm = function (credentials) {
    return page.setEmail(credentials.email).then(function () {
      return page.setPassword(credentials.password);
    });
  };
};

module.exports = LoginPage;
