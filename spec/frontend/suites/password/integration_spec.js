describe("Integration tests for password page", function () {
  var loginPage = new LoginPage();
  var passwordPage = new PasswordPage();
  var headerPage = new HeaderPage();
  var membersPage = new MembersPage();
  var currentUser = protractor.authHelper.basicUsers.user1;
  var resetLink;

  beforeAll(function () {
    return browser.get(browser.baseUrl);
  });
  afterEach(function () {
    return protractor.pageHelper.clearAlerts();
  });

  it("Can be navigated to", function () {
    expect(browser.getCurrentUrl()).not.toEqual(loginPage.getUrl());
    headerPage.goToSignIn().then(function () {
      loginPage.toggleForgotPassword().then(function () {
        expect(browser.getCurrentUrl()).toEqual(passwordPage.getUrl());
      });
    });
  });
  it("Form is invalid without an email", function () {
    expect(passwordPage.emailValid()).toBeFalsy();
  });
  it("Form is valid with email", function () {
    passwordPage.setEmail(currentUser.email).then(function () {
      browser.sleep(2000).then(function () {
        expect(passwordPage.emailValid()).toBeTruthy();
      });
    });
  });
  it("Submitting form sends password reset email", function () {
    protractor.mailHelper.emptyMail().then(function () {
      passwordPage.submit().then(function () {
        return browser.driver.wait(function () {
          return protractor.pageHelper.alertsPresent().then(function (p) {
            return p;
          });
        }, 10000).then(function () {
          protractor.mailHelper.extractPasswordLink(currentUser.email).then(function (url) {
            resetLink = url;
            expect(resetLink).toBeTruthy();
            expect(resetLink).toMatch(new RegExp(passwordPage.getUrl() + "/[A-Za-z0-9+]"));
          });
        });
      });
    });
  });
  it("Reset link displays reset form", function () {
    browser.driver.get(resetLink).then(function () {
      browser.sleep(2000).then(function () {
        expect(browser.getCurrentUrl()).toMatch(new RegExp(passwordPage.getUrl() + "/[A-Za-z0-9+]"));
      });
    });
  });
  it("Password and Password Confirmation are required", function () {
    passwordPage.submit().then(function () {
      expect(browser.getCurrentUrl()).toMatch(new RegExp(passwordPage.getUrl() + "/[A-Za-z0-9+]"));
      passwordPage.setPassword("password_foobar").then(function () {
        passwordPage.setPasswordConfirmation("password_foobar").then(function () {
          expect(passwordPage.passwordValid()).toBeTruthy();
        });
      });
    });
  });
  it("Signs user in and redirects to members page on success", function () {
    return passwordPage.submit().then(function () {
      return browser.driver.wait(function(){
          return browser.driver.getCurrentUrl().then(function(url){
              return !new RegExp(passwordPage.getUrl()).test(url);
          });
      }, 10000).then(function () {
        expect(protractor.pageHelper.getAlerts().count()).toEqual(1);
        expect(protractor.pageHelper.getSuccessAlerts().count()).toEqual(1);
        expect(browser.getCurrentUrl()).toEqual(membersPage.getUrl());
      });
    });
  });
});
