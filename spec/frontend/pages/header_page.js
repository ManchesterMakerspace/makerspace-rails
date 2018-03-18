var HeaderPage = function () {
  var rootLink = element(by.css('a[ui-sref="root.members"]'));
  var membersLink = element(by.css('a[ui-sref="root.members"]'));
  var rentalsLink = element(by.css('a[ui-sref="root.rentals"]'));
  var membershipLink = element(by.css('a[ui-sref="root.admin.memberships.new"]'));
  var signInLink = element(by.css('a[ui-sref="login"]'));
  var signOutLink = element(by.cssContainingText("button", "Sign Out"));

  this.linkAvailable = function (linkName) {
    var el = eval(linkName + 'Link');
    return protractor.pageHelper.isDisplayed(el);
  };
  this.goToLink = function (linkName) {
    var el = eval(linkName + 'Link');
    return el.click();
  };
  this.goToSignIn = function () {
    return signInLink.click();
  };
  this.signOut = function () {
    return signOutLink.click();
  };
  
};

module.exports = HeaderPage;
