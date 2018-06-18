var RegisterPage = function () {
  var url = browser.baseUrl + "register";
  var welcomeNotice = element(by.css("div.member-edit-form"));
  var step1Button = welcomeNotice.element(by.cssContainingText("button", "Proceed"));

  var registerForm = element(by.css("form.member-edit-form"));
  var firstnameInput = registerForm.element(by.model("registerCtrl.registerForm.firstname"));
  var lastnameInput = registerForm.element(by.model("registerCtrl.registerForm.lastname"));
  var groupCheckbox = registerForm.element(by.model("registerCtrl.group"));
  var groupInput = registerForm.element(by.model("registerCtrl.registerForm.groupName"));
  var groupOptions = element.all(by.css(".group-option"));
  var emailInput = registerForm.element(by.model("registerCtrl.registerForm.email"));
  var passwordInput = registerForm.element(by.model("registerCtrl.registerForm.password"));
  var passwordConfirmationInput = registerForm.element(by.model("registerCtrl.registerForm.password_confirmation"));
  var step2Button = registerForm.element(by.css('button[type="submit"]'));

  var eSign = element(by.css(".esign"));
  var contract = eSign.element(by.css(".contract"));
  var conduct = eSign.element(by.css(".conduct"));
  var toggleContract = eSign.element(by.cssContainingText("button", "Next"));
  var signaturePad = eSign.element(by.css(".signature canvas"));
  var clearSignature = eSign.element(by.css('button[ng-click="signCtrl.clear()"]'));
  var submitSignature = eSign.element(by.css('button[ng-click="signCtrl.done()"]'));

  var timeSlotInput = element(by.model("registerCtrl.timeSlot"));
  var timeSlotOptions = element.all(by.repeater("event in registerCtrl.availableTimeSlots"));
  var confirmTimeSlotButton = element(by.css('button[ng-click="registerCtrl.selectTimeslot()"]'));
  var calendar = element(by.css("iframe"));

  this.getUrl = function () {
    return url;
  };
  this.setInput = function (input, content) {
    var el = eval(input + "Input");
    return el.clear().sendKeys(content);
  };
  this.getInput = function (input) {
    var el = eval(input + "Input");
    return el.getAttribute('value');
  };
  this.inputValid = function (inputName) {
    var el = eval(inputName + "Input");
    return protractor.pageHelper.inputValid(el);
  };
  this.welcomeNoticePresent = function () {
    return protractor.pageHelper.isDisplayed(welcomeNotice);
  };
  this.registerFormDisplayed = function () {
    return protractor.pageHelper.isDisplayed(registerForm);
  };
  this.proceed = function () {
    return protractor.pageHelper.isDisplayed(welcomeNotice).then(function (d) {
      if(d) {
        return step1Button.click();
      } else {
        return protractor.pageHelper.isDisplayed(registerForm).then(function (e) {
          if(e) {
            return step2Button.click();
          } else {
            return protractor.pageHelper.isDisplayed(conduct).then(function (f) {
              if(f) {
                toggleContract.click();
              } else {
                return protractor.pageHelper.isDisplayed(contract).then(function (g) {
                  if(g) {
                    return submitSignature.click();
                  } else {
                    return confirmTimeSlotButton.click();
                  }
                });
              }
            });
          }
        });
      }
    });
  };
  this.showGroupInput = function () {
    return groupCheckbox.click();
  };
  this.setGroup = function (groupName) {
    return groupInput.click().then(function () {
      return browser.sleep(1000).then(function () {
        return groupOptions.filter(function (opt) {
          return opt.getText().then(function (text) {
            return text.toLowerCase() === groupName.toLowerCase();
          });
        }).first().click();
      });
    });
  };
  this.groupInputPresent = function () {
    return protractor.pageHelper.isDisplayed(groupInput);
  };
  this.getGroup = function () {
    return groupInput.getText();
  };
  this.selectTimeslot = function () {
    return timeSlotInput.click().then(function () {
      return browser.sleep(1000).then(function () {
        return timeSlotOptions.get(0).click();
      });
    });
  };
  this.calendarDisplayed = function () {
    return protractor.pageHelper.isDisplayed(calendar);
  };
  this.codeOfConductDisplayed = function () {
    return protractor.pageHelper.isDisplayed(conduct);
  };
  this.memberContractDisplayed = function () {
    return protractor.pageHelper.isDisplayed(contract);
  };
  this.signContract = function () {
    return browser.actions(). //Should draw a square w/ X in it
        mouseMove(signaturePad).
        mouseDown().
        mouseMove({x: 10, y: 10}).
        mouseMove({x: -10, y: 0}).
        mouseMove({x: 10, y: -10}).
        mouseMove({x: -10, y: 0}).
        mouseUp().
        perform();
  };
};

module.exports = RegisterPage;
