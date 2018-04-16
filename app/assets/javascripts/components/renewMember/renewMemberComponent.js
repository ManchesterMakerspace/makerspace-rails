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

function renewMemberController(memberService, alertService, $filter, $stateParams) {
  var renewMemberCtrl = this;
  renewMemberCtrl.$onInit = function() {
    if ($stateParams.id) {
      renewMemberCtrl.renewalForm = {
        member: $filter('filter')(renewMemberCtrl.members, { id: $stateParams.id })[0]
      };
    }
  };

  renewMemberCtrl.renewMember = function(form){
    if(!form.$valid) {return;}
    renewMemberCtrl.renewalForm.member.renewal = renewMemberCtrl.renewalForm.months;
    return memberService.renewMember(renewMemberCtrl.renewalForm.member).then(function(member){
      alertService.addAlert('Member renewed!', 'success');
      renewMemberCtrl.renewalForm = {};
      renewMemberCtrl.updatedMembers.push(member);
    });
  };
}
