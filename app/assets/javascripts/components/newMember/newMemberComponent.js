app.component('newMemberComponent', {
  templateUrl: 'components/newMember/_newMember.html',
  controller: newMemberController,
  controllerAs: "newMemberCtrl",
  bindings: {
    card: '<',
    updatedMembers: '=',
    groups: '<'
  }
});

function newMemberController(memberService, cardService, alertService) {
  var newMemberCtrl = this;
  newMemberCtrl.$onInit = function() {
    console.log(newMemberCtrl.groups);
    // newMemberCtrl.roles = ['member', 'officer', 'admin'];
    newMemberCtrl.newMember = {
      cardID: newMemberCtrl.card.uid
    };
  };

  newMemberCtrl.submitMember = function(form){
    if(!form) {return;}
    return memberService.createMember(newMemberCtrl.newMember).then(function(member){
      alertService.addAlert('Member saved!', 'success');
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
