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

function newMemberController(memberService, cardService, alertService, slackService, $timeout) {
  var newMemberCtrl = this;
  newMemberCtrl.$onInit = function() {
    newMemberCtrl.newMember = {
      cardID: newMemberCtrl.card.uid
    };
  };

  newMemberCtrl.submitMember = function(form){
    if(!form) {return;}
    return memberService.createMember(newMemberCtrl.newMember).then(function(member){
      newMemberCtrl.newMember = {};
      slackService.connect();
      return $timeout(function(){
        slackService.invite(member.email, member.fullname);
      }, 500).then(function(){
        return $timeout(function(){
          slackService.disconnect();
          }, 500).then(function(){
            alertService.addAlert('Member saved!', 'success');
            newMemberCtrl.updatedMembers.push(member);
          });
      }).catch(function(err){
        console.log(err);
        alertService.addAlert("Error inviting to Slack!", "danger");
      });
    }).catch(function(err){
      console.log(err);
      alertService.addAlert("Error creating member!", "danger");
    });
  };

  newMemberCtrl.refreshCardID = function() {
    return cardService.getLatestRejection().then(function(card){
      newMemberCtrl.newMember.cardID = card.uid;
      return newMemberCtrl.newMember.cardID;
    });
  };
}
