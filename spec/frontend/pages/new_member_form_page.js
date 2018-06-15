var NewMemberFormPage = function () {
  var contractToggleInput = element(by.model("newMemberCtrl.newMember.memberContractOnFile"));
  var firstnameInput = element(by.model("newMemberCtrl.newMember.firstname"));
  var lastnameInput = element(by.model("newMemberCtrl.newMember.lastname"));
  var cardIdInput = element(by.model("newMemberCtrl.newMember.cardID"));
  var refreshCardButton = element(by.css('button[ng-click="newMemberCtrl.refreshCardID()"]'));
  var groupSelect = element(by.model("newMemberCtrl.newMember.groupName"));
  var groupOptions = element.all(by.repeater("group in newMemberCtrl.groups"));
  var renewalMonthsInput = element(by.model("newMemberCtrl.newMember.renewal"));
  var renewalMonthsOptions = element.all(by.css(".renewal-option"));
  var emailInput = element(by.model("newMemberCtrl.newMember.email"));
  var passwordInput = element(by.model("newMemberCtrl.newMember.password"));
  var passwordConfirmationInput = element(by.model("newMemberCtrl.newMember.password_confirmation"));
  var submit = element(by.css('button[type="submit"]'));
  var url = browser.baseUrl + 'memberships/new';
  this.get = function () {
    return browser.get(url);
  };
  this.getUrl = function () {
    return url;
  };

  this.toggleContractInput = function () {
    return contractToggleInput.click();
  };
  this.inputEnabled = function (input) {
    var el = eval(input + "Input");
    return el.isEnabled();
  }
  this.setInput = function (input, content) {
    var el = eval(input + "Input");
    return el.clear().sendKeys(content);
  };
  this.getInput = function (input) {
    var el = eval(input + "Input");
    return el.getAttribute('value');
  };
  this.setGroup = function (groupName) {
    return groupSelect.click().then(function () {
      return browser.sleep(500).then(function () {
        return groupOptions.filter(function (opt) {
          return opt.getText().then(function (text) {
            return text.toLowerCase() === groupName.toLowerCase();
          });
        }).first().click();
      });
    });
  };
  this.setRenewal = function (month) {
    return renewalMonthsInput.click().then(function () {
      return browser.sleep(500).then(function () {
        return renewalMonthsOptions.filter(function (opt) {
          return opt.getText().then(function (text) {
            return parseInt(text) === month;
          });
        }).first().click();
      });
    });
  };
  this.refreshCardID = function () {
    return refreshCardButton.click();
  };
  this.submit = function () {
    return submit.click();
  };
  this.inputValid = function (inputName) {
    var el = eval(inputName + "Input");
    return protractor.pageHelper.inputValid(el);
  };
};

module.exports = NewMemberFormPage;
