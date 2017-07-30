app.component('renewMemberComponent', {
  templateUrl: 'components/renewMember/_renewMember.html',
  controller: renewMemberController,
  controllerAs: "renewMemberCtrl",
  bindings: {
    members: '<',
    updatedMembers: '='
  }
});

function renewMemberController(memberService) {
  var renewMemberCtrl = this;
  renewMemberCtrl.$onInit = function() {
  };

  renewMemberCtrl.renewMember = function(form){
    if(!form) {return;}
    // console.log(renewMemberCtrl.renewalMember)
    return memberService.renewMember(renewMemberCtrl.renewalForm.member).then(function(member){
      renewMemberCtrl.updatedMembers.push(member);
    });
  };
}
