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
    renewMemberCtrl.blockForm = false;

    if ($stateParams.id) {
      renewMemberCtrl.renewalForm = {
        member: $filter('filter')(renewMemberCtrl.members, { id: $stateParams.id })[0]
      };
    }
  };

  renewMemberCtrl.renewMember = function(form){
    if(!form.$valid) {return;}
    return memberService.updateMember(renewMemberCtrl.renewalForm.member).then(function(member){
      // renewMemberCtrl.blockForm = false;
      alertService.addAlert('Member renewed!', 'success');
      renewMemberCtrl.renewalForm = {};
      renewMemberCtrl.updatedMembers.push(member);
    });
  };
}
