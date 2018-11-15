app.component('memberEditComponent', {
  templateUrl: 'components/memberEdit/_memberEdit.html',
  controller: memberEditController,
  controllerAs: "memberEditCtrl",
  bindings: {
    member: '<',
    cards: '<',
    groups: '<'
  }
});

function memberEditController(cardService, memberService, $state, $filter, alertService) {
  var memberEditCtrl = this;
  memberEditCtrl.$onInit = function() {
    memberEditCtrl.editForm = {};
    angular.copy(memberEditCtrl.member, memberEditCtrl.editForm);
    memberEditCtrl.editForm.expirationTime = new Date(memberEditCtrl.editForm.expirationTime);
    memberEditCtrl.statuses = ["activeMember", "nonMember", "revoked", "inactive"];
    memberEditCtrl.roles = ["member", "officer", "admin"];
  };

  memberEditCtrl.newCardForm = function(){
    memberEditCtrl.newCard = {
      member_id: memberEditCtrl.member.id
    };
    return memberEditCtrl.refreshCardID();
  };

  memberEditCtrl.reportCard = function(card, status){
    memberEditCtrl.reportedCard = {
      id: card.id,
      uid: card.uid,
      card_location: status
    };
    return cardService.updateCard(memberEditCtrl.reportedCard).then(function(){
      alertService.addAlert('Card reported!', 'success');
      card.validity = status;
    });
  };

  memberEditCtrl.refreshCardID = function() {
    return cardService.getLatestRejection().then(function(card){
      memberEditCtrl.newCard.uid = card.uid;
      return memberEditCtrl.newCard.uid;
    });
  };

  memberEditCtrl.createCard = function(){
    if(!memberEditCtrl.newCard.uid) {return;}
    return cardService.createCard(memberEditCtrl.newCard).then(function(card){
      alertService.addAlert('Card saved!', 'success');
      memberEditCtrl.cards.push(card);
      memberEditCtrl.newCard = null;
      // return memberEditCtrl.refreshCardID();
    });
  };

  memberEditCtrl.updateMember = function(form){
    if(!form){return;}
    if (!!memberEditCtrl.newCard && memberEditCtrl.newCard.uid){
      memberEditCtrl.editForm.cards_attributes = memberEditCtrl.newCard;
    } else if (!!memberEditCtrl.reportedCard && memberEditCtrl.reportedCard.card_location) {
      memberEditCtrl.editForm.cards_attributes = memberEditCtrl.reportedCard;
    }
    memberEditCtrl.editForm.expirationTime = memberEditCtrl.editForm.expirationTime.getTime();
    return memberService.updateMember(memberEditCtrl.editForm).then(function(response){
      memberEditCtrl.member = response;
      angular.copy(memberEditCtrl.member, memberEditCtrl.editForm);
      memberEditCtrl.editForm.expirationTime = new Date(memberEditCtrl.editForm.expirationTime);
      alertService.addAlert('Member updated!', 'success');
    });
  };

  memberEditCtrl.noActiveCards = function(){
    return $filter('filter')(memberEditCtrl.cards, function(card){
      return card.validity !== 'lost' && card.validity !== 'stolen';
    }).length === 0;
  };
}
