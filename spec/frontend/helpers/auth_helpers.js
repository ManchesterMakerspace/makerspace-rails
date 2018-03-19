exports.adminUsers = {
  user1: {
    fullname: 'Admin Member1',
    email: 'admin_member_1@test.com',
    password: 'password'
  }
};
exports.basicUsers = {
  user1: {
    fullname: 'Basic Member1',
    email: 'basic_member_1@test.com',
    password: 'password'
  },
  user2: {
    fullname: 'Basic Member2',
    email: 'basic_member_2@test.com',
    password: 'password'
  },
  user3: {
    fullname: 'Basic Member3',
    email: 'basic_member_3@test.com',
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

exports.logout = function(){
    browser.get(browser.baseUrl);
    var headerPage = new HeaderPage();
    return headerPage.signOut();
};
