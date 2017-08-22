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

function newMemberController(memberService, cardService, alertService, slackService) {
  var newMemberCtrl = this;
  newMemberCtrl.$onInit = function() {
    newMemberCtrl.newMember = {
      cardID: newMemberCtrl.card.uid
    };
  };

  newMemberCtrl.submitMember = function(form){
    if(!form) {return;}
    return memberService.createMember(newMemberCtrl.newMember).then(function(member){
      newMemberCtrl.newMember.cardID = null;
      slackService.connect();
      slackService.invite(newMemberCtrl.newMember.email, newMemberCtrl.newMember.fullname);
      slackService.disconnect();
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
