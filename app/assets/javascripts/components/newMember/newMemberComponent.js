app.component('newMemberComponent', {
  templateUrl: 'components/newMember/_newMember.html',
  controller: newMemberController,
  controllerAs: "newMemberCtrl",
  bindings: {
    card: '<',
    updatedMembers: '='
  }
});

function newMemberController(memberService, cardService) {
  var newMemberCtrl = this;
  newMemberCtrl.$onInit = function() {
    newMemberCtrl.newMember = {
      cardID: newMemberCtrl.card.uid
    };
  };

  newMemberCtrl.submitMember = function(form){
    if(!form) {return;}
    return memberService.createMember(newMemberCtrl.newMember).then(function(member){
      newMemberCtrl.updatedMembers.push(member);
    });
  };

  newMemberCtrl.refreshCardID = function() {
    return cardService.getLatestRejection().then(function(card){
      newMemberCtrl.newMember.cardID = card.uid;
      return newMemberCtrl.newMember.cardID;
    });
  };
}
