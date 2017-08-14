app.component('memberEditComponent', {
  templateUrl: 'components/memberEdit/_memberEdit.html',
  controller: memberEditController,
  controllerAs: "memberEditCtrl",
  bindings: {
    member: '<',
    cards: '<'
  }
});

function memberEditController(cardService, memberService, $state, $filter) {
  var memberEditCtrl = this;
  memberEditCtrl.$onInit = function() {
    memberEditCtrl.editForm = memberEditCtrl.member;
    memberEditCtrl.statuses = ["activeMember", "nonMember", "revoked"];
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
    if(!memberEditCtrl.newCard) {return;}
    return cardService.createCard(memberEditCtrl.newCard).then(function(card){
      memberEditCtrl.cards.push(card);
      memberEditCtrl.newCard = null;
      // return memberEditCtrl.refreshCardID();
    });
  };

  memberEditCtrl.updateMember = function(form){
    if(!form){return;}
    if (!!memberEditCtrl.newCard && memberEditCtrl.newCard.uid){
      memberEditCtrl.member.cards_attributes = memberEditCtrl.newCard;
    } else if (!!memberEditCtrl.reportedCard && memberEditCtrl.reportedCard.card_location) {
      memberEditCtrl.member.cards_attributes = memberEditCtrl.reportedCard;
    }
    return memberService.updateMember(memberEditCtrl.member).then(function(){
      $state.go('root.members');
    });
  };

  memberEditCtrl.noActiveCards = function(){
    return $filter('filter')(memberEditCtrl.cards, function(card){
      console.log(card.validity !== 'lost' && card.validity !== 'stolen');
      return card.validity !== 'lost' && card.validity !== 'stolen';
    }).length === 0;
  };
}
