app.component('renewMemberComponent', {
  templateUrl: 'components/renewMember/_renewMember.html',
  controller: renewMemberController,
  controllerAs: "renewMemberCtrl",
  bindings: {
    members: '<',
    updatedMembers: '=',
    member: '<'
  }
});

function renewMemberController(memberService, alertService) {
  var renewMemberCtrl = this;
  renewMemberCtrl.$onInit = function() {
    if (renewMemberCtrl.member) {
      renewMemberCtrl.renewalForm.member = renewMemberCtrl.member;
      renewMemberCtrl.members = memberService.getAllMembers();
    }
  };

  renewMemberCtrl.renewMember = function(form){
    if(!form) {return;}
    // console.log(renewMemberCtrl.renewalMember)
    return memberService.updateMember(renewMemberCtrl.renewalForm.member).then(function(member){
      alertService.addAlert('Member renewed!', 'success');
      renewMemberCtrl.renewalForm = {};
      renewMemberCtrl.updatedMembers.push(member);
    });
  };
}
