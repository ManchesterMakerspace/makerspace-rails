var NewMemberFormPage = function () {
  var contractToggle = element(by.model("newMemberCtrl.newMember.memberContractOnFile"));
  var nameInput = element(by.model("newMemberCtrl.newMember.fullname"));
  var cardIdInput = element(by.model("newMemberCtrl.newMember.cardID"));
  var refreshCardButton = element(by.css('button[ng-click="newMemberCtrl.refreshCardID()"]'));
  var groupSelect = element(by.model("newMemberCtrl.newMember.groupName"));
  var groupOptions = element.all(by.repeater("group in newMemberCtrl.groups"));
  var startDateInput = element(by.model("newMemberCtrl.newMember.renewal.startDate"));
  var calendar = element(by.css("md-calendar-month"));
  var calendarDate = element(by.css(".md-calendar-date-today"));
  var renewalMonthsSelect = element(by.model("newMemberCtrl.newMember.renewal.months"));
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
    return contractToggle.click();
  };

  this.setInput = function (input, content) {
    var el = eval(input + "Input");
    return el.clear().sendKeys(content);
  };
  this.getInput = function (input) {
    var el = eval(input + "Input");
    return el.getText();
  };
  this.setGroup = function (groupName) {
    return groupSelect.click().then(function () {
      return groupOptions.filter(function (opt) {
        return opt.getText().then(function (text) {
          return text.toLowerCase() === groupName.toLowerCase();
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
  this.refreshCardID = function () {
    return refreshCardButton.click();
  };
  this.submit = function () {
    return submit.click();
  };
  this.getDateInput = function(){
      return startDateInput.getAttribute('value');
  };
  this.openCalendar = function(){
      return startDateInput.click();
  };
  this.calendarOpen = function(){
      return calendar.isPresent();
  };
  this.selectCalendarDate = function(){
      return browser.actions().mouseMove(calendarDate).click().perform();
  };
};
