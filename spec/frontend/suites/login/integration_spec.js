describe("Integration tests for login page", function () {
  var loginPage = new LoginPage();
  var headerPage = new HeaderPage();
  var membersPage = new MembersPage();
  var currentUser = protractor.authHelper.basicUsers.user1;

  beforeAll(function () {
    return browser.get(browser.baseUrl);
  });
  afterEach(function () {
    return protractor.pageHelper.clearAlerts();
  });
  afterAll(function () {
    return protractor.coverageHelper.loadCoverage();
  });

  it("Can be navigated to", function () {
    expect(browser.getCurrentUrl()).not.toEqual(loginPage.getUrl());
    headerPage.goToSignIn().then(function () {
      expect(browser.getCurrentUrl()).toEqual(loginPage.getUrl());
    });
  });
  it("Form is invalid without an email or password", function () {
    expect(loginPage.emailValid()).toBeFalsy();
    expect(loginPage.passwordValid()).toBeFalsy();
  });
  it("Form is valid with email and password", function () {
    loginPage.setEmail(currentUser.email).then(function () {
      loginPage.setPassword('not password').then(function () {
        expect(loginPage.emailValid()).toBeTruthy();
        expect(loginPage.passwordValid()).toBeTruthy();
      });
    });
  });
  it("Displays an error message if credentials are incorrect", function () {
    expect(protractor.pageHelper.getAlerts().count()).toEqual(0);
    loginPage.submitLogin().then(function () {
      expect(protractor.pageHelper.getAlerts().count()).toEqual(1);
      expect(protractor.pageHelper.getErrorAlerts().count()).toEqual(1);
    });
  });
  it("Signs user in and redirects to members page on success", function () {
    return loginPage.setPassword(currentUser.password).then(function () {
      return loginPage.submitLogin().then(function () {
        return browser.driver.wait(function(){
            return browser.driver.getCurrentUrl().then(function(url){
                return !(/login/).test(url);
            });
        }, 10000).then(function () {
          expect(protractor.pageHelper.getAlerts().count()).toEqual(1);
          expect(protractor.pageHelper.getSuccessAlerts().count()).toEqual(1);
          expect(browser.getCurrentUrl()).toEqual(membersPage.getUrl());
        });
      });
    });
  });
});
