var RenewMemberFormPage = function () {
  var submit = element(by.css('button[type="submit"]'));
  var renewalMemberSelect = element(by.model("renewMemberCtrl.renewalForm.member"));
  var renewalMemberOptions = element.all(by.repeater("member in renewMemberCtrl.members"));
  var renewalMonthsSelect = element(by.model("renewMemberCtrl.renewalForm.member.renewal.months"));
  var renewalMonthsOptions = element.all(by.css(".renewal-option"));

  var selectedMemberName = element(by.binding("renewMemberCtrl.renewalForm.member.fullname"));
  var selectedMemberExpiry = element(by.binding("renewMemberCtrl.renewalForm.member.expirationTime"));
  var url = browser.baseUrl + 'memberships/renew';
  this.get = function () {
    return browser.get(url);
  };
  this.getUrl = function () {
    return url;
  };

  this.setMember = function (memberName) {
    return renewalMemberSelect.click().then(function () {
      return renewalMemberOptions.filter(function (opt) {
        return opt.getText().then(function (text) {
          return text.toLowerCase() === memberName.toLowerCase();
        });
      }).first().click();
    });
  };
  this.setRenewal = function (month) {
    return renewalMonthsSelect.click().then(function () {
      return renewalMonthsOptions.filter(function (opt) {
        return opt.getText().then(function (text) {
          return text.toLowerCase() === month.toLowerCase();
        });
      }).first().click();
    });
  };
  this.submit = function () {
    return submit.click();
  };
  this.getMemberName = function () {
    return selectedMemberName.getText();
  };
  this.getMemberExpiry = function () {
    return selectedMemberExpiry.getText();
  };
};

module.exports = RenewMemberFormPage;
