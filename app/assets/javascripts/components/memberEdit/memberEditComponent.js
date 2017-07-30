app.component('memberEditComponent', {
  templateUrl: 'components/memberEdit/_memberEdit.html',
  controller: memberEditController,
  controllerAs: "memberEditCtrl",
  bindings: {
    member: '<'
  }
});

function memberEditController() {
  var memberEditCtrl = this;
  memberEditCtrl.$onInit = function() {
    memberEditCtrl.editForm = memberEditCtrl.member;
    memberEditCtrl.statuses = ["activeMember", "nonMember", "revoked"];
    memberEditCtrl.roles = ["member", "officer", "admin"];
  };
}
