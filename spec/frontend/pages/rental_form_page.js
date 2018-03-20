var RentalFormPage = function () {
  var submit = element(by.css('button[type="submit"]'));
  var rentalNumberInput = element(by.model("rentalFormCtrl.rentalForm.number"));
  var rentalMemberInput = element(by.model("rentalFormCtrl.rentalForm.member_id"));
  var rentalMemberOptions = element.all(by.repeater("member in rentalFormCtrl.members"));
  var rentalExpirationInput = element(by.model("rentalFormCtrl.rentalForm.expiration"));
  var calendar = element(by.css("md-calendar-month"));
  var calendarDate = element(by.css(".md-calendar-date-today"));
  var deleteRentalButton = element(by.css("button.btn-warning"));
  var cancelRentalCreationButton = element(by.css("button.btn-danger"));
  var url = browser.baseUrl + 'rentals/new';

  this.deleteButtonDisplayed = function () {
    return protractor.pageHelper.isDisplayed(deleteRentalButton);
  };
  this.getUrl = function () {
    return url;
  };
  this.get = function () {
    return browser.get(url);
  };
  this.inputValid = function (input) {
    var el = eval(input + "Input");
    return protractor.pageHelper.inputValid(el);
  };
  this.setInput = function (input, content) {
    var el = eval(input + "Input");
    return el.clear().sendKeys(content);
  };
  this.getInput = function (input) {
    var el = eval(input + "Input");
    return el.getAttribute('value');
  };
  this.getMemberOptions = function () {
    return rentalMemberOptions;
  };
  this.setMember = function (memberName) {
    return rentalMemberInput.click().then(function () {
      return rentalMemberOptions.filter(function (opt) {
        return opt.getText().then(function (text) {
          return text.toLowerCase() === memberName.toLowerCase();
        });
      }).first().click();
    });
  };
  this.getMember = function () {
    return rentalMemberInput.getText();
  };
  this.submit = function () {
    return submit.click();
  };
  this.deleteRental = function () {
    return deleteRentalButton.click();
  };
  this.cancelForm = function () {
    return cancelRentalCreationButton.click();
  };
  this.getDateInput = function(){
      return rentalExpirationInput.element(by.css("input")).getAttribute('value');
  };
  this.openCalendar = function(){
      return rentalExpirationInput.click();
  };
  this.calendarOpen = function(){
      return calendar.isPresent();
  };
  this.selectCalendarDate = function(){
      return browser.actions().mouseMove(calendarDate).click().perform();
  };
};

module.exports = RentalFormPage;
