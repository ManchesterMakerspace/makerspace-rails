app.component('renewMemberComponent', {
  templateUrl: 'components/renewMember/_renewMember.html',
  controller: renewMemberController,
  controllerAs: "renewMemberCtrl",
  bindings: {
    member: '<'
  }
});

function renewMemberController() {
  var renewMemberCtrl = this;
  renewMemberCtrl.$onInit = function() {
    console.log(renewMemberCtrl.member)
  };
}
