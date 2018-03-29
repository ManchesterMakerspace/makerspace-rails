var InvitePage = function () {
  var url = browser.baseUrl + "memberships/invite/";
  var confirmation = element(by.css("h4"));
  var confirmButton = element(by.css(".btn-success"));
  var cancelButton = element(by.css(".btn-danger"));

  this.get = function (email) {
    return browser.get(url + email);
  };
  this.getUrl = function (email) {
    return url + email;
  };
  this.getConfirmationMsg = function () {
    return confirmation.getText();
  };
  this.confirmInvite = function () {
    return confirmButton.click();
  };
  this.cancelInvite = function () {
    return cancelButton.click();
  };
};

module.exports = InvitePage;
