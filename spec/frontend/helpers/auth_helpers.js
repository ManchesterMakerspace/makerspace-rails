exports.adminUsers = {
  user1: {
    firstname: 'Admin',
    lastname: 'Member1',
    email: 'admin_member1@test.com',
    password: 'password'
  }
};
exports.basicUsers = {
  user1: {
    firstname: 'Basic',
    lastname: 'Member1',
    email: 'basic_member1@test.com',
    password: 'password'
  },
  user2: {
    firstname: 'Basic',
    lastname: 'Member2',
    email: 'basic_member2@test.com',
    password: 'password'
  },
  user3: {
    firstname: 'Basic',
    lastname: 'Member3',
    email: 'basic_member3@test.com',
    password: 'password'
  }
};


exports.loginUser = function(credentials){
  var loginPage = new LoginPage();
  return browser.driver.manage().deleteAllCookies().then(function() {
      return loginPage.get().then(function() {
          return loginPage.completeForm(credentials).then(function() {
              return loginPage.submitLogin().then(function() {

                  //Wait for url to change to quizzes
                  return browser.driver.wait(function(){
                      return browser.driver.getCurrentUrl().then(function(url){
                          return !(/login/).test(url);
                      });
                  }, 10000);
              });
          });
      });
  });
};

exports.userLoggedIn = function () {
  var headerPage = new HeaderPage();
  return headerPage.linkAvailable('signOut').then(function (a) {
    return a;
  });
};

exports.logout = function(){
    browser.get(browser.baseUrl);
    var headerPage = new HeaderPage();
    return headerPage.signOut();
};
