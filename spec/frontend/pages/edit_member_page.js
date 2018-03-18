var EditMemberPage = function () {
  var nameInput = element(by.model("memberEditCtrl.editForm.fullname"));
  var expiry = element(by.binding("memberEditCtrl.member.expirationTime"));
  var emailInput = element(by.model("memberEditCtrl.editForm.email"));
  var groupSelect = element(by.model("memberEditCtrl.editForm.groupName"));
  var groupOptions = element.all(by.css(".group-option"));
  var statusSelect = element(by.model("memberEditCtrl.editForm.status"));
  var statusOptions = element.all(by.repeater("status in memberEditCtrl.statuses"));
  var displayRoleButton = element(by.css(".member-role"));
  var roleSelect = element(by.model("memberEditCtrl.editForm.role"));
  var roleOptions = element.all(by.repeater("role in memberEditCtrl.roles"));
  var passwordInput = element(by.model("memberEditCtrl.editForm.password"));
  var passwordConfirmationInput = element(by.model("memberEditCtrl.editForm.passwordConfirmation"));
  var showDetailsButton = element(by.css(".details-button"));
  var memberCards = element.all(by.repeater("card in memberEditCtrl.cards"));
  var cardId = element(by.binding("card.id.substr(card.id.length - 5)"));
  var cardStatus = element(by.binding("card.validity"));
  var reportLostButton = element(by.cssContainingText("button", "Lost"));
  var reportStolenButton = element(by.cssContainingText("button", "Stolen"));
  var newCardButton = element(by.cssContainingText("button", "New Card"));
  var cardIdInput = element(by.model("memberEditCtrl.newCard.uid"));
  var refreshCardButton = element(by.css('button[ng-click="memberEditCtrl.refreshCardID()"]'));
  var createCardButton = element(by.css('button[ng-click="memberEditCtrl.createCard()"]'));
  var submit = element(by.css('button[type="submit"]'));

  this.setInput = function (input, content) {
    var el = eval(input + "Input");
    return el.clear().sendKeys(content);
  };
  this.getInput = function (input) {
    var el = eval(input + "Input");
    return el.getText();
  };
  this.getExpiry = function () {
    return expiry.getText();
  };
  this.showDetails = function () {
    return showDetailsButton.click();
  };
  this.showRoleForm = function () {
    return displayRoleButton.click();
  };
  this.getCards = function () {
    return memberCards;
  };
  this.getCardId = function (card) {
    return card.element(cardId.locator()).getText();
  };
  this.getCardStatus = function (card) {
    return card.element(cardStatus.locator()).getText();
  };
  this.reportLost = function (card) {
    return card.element(reportLostButton.locator()).click();
  };
  this.reportStolen = function (card) {
    return card.element(reportStolenButton.locator()).click();
  };
  this.refreshCardID = function () {
    return refreshCardButton.click();
  };
  this.startCreateCard = function () {
    return createCardButton.click();
  };
  this.submitNewCard = function () {
    return newCardButton.click();
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
  this.setStatus = function (status) {
    return statusSelect.click().then(function () {
      return statusOptions.filter(function (opt) {
        return opt.getText().then(function (text) {
          return text.toLowerCase() === status.toLowerCase();
        });
      }).first().click();
    });
  };
  this.setRole = function (role) {
    return roleSelect.click().then(function () {
      return roleOptions.filter(function (opt) {
        return opt.getText().then(function (text) {
          return text.toLowerCase() === role.toLowerCase();
        });
      }).first().click();
    });
  };
  this.submit = function () {
    return submit.click();
  };
};

module.exports = EditMemberPage;
