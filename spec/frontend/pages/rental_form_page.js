var RentalFormPage = function () {
  var submit = element(by.css('button[type="submit"]'));
  var rentalNumberInput = element(by.model("rentalFormCtrl.rentalForm.number"));
  var rentalMemberSelect = element(by.model("rentalFormCtrl.rentalForm.member_id"));
  var rentalMemberOptions = element.all(by.repeater("member in rentalFormCtrl.members"));
  var rentalExpirationInput = element(by.model("rentalFormCtrl.rentalForm.expiration"));
  var calendar = element(by.css("md-calendar-month"));
  var calendarDate = element(by.css(".md-calendar-date-today"));
  var deleteRentalButton = element(by.css("button.btn-warning"));
  var cancelRentalCreationButton = element(by.css("button.btn-danger"));
  var url = browser.baseUrl + 'rentals/new';

  this.getUrl = function () {
    return url;
  };
  this.get = function () {
    return browser.get(url);
  };
  this.setInput = function (input, content) {
    var el = eval(input + "Input");
    return el.clear().sendKeys(content);
  };
  this.getInput = function (input) {
    var el = eval(input + "Input");
    return el.getText();
  };
  this.setMember = function (memberName) {
    return rentalMemberSelect.click().then(function () {
      return rentalMemberOptions.filter(function (opt) {
        return opt.getText().then(function (text) {
          return text.toLowerCase() === memberName.toLowerCase();
        });
      }).first().click();
    });
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
      return rentalExpirationInput.getAttribute('value');
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
