app.component('membershipsComponent', {
  templateUrl: 'components/memberships/_memberships.html',
  controller: membershipsController,
  controllerAs: "membershipCtrl",
  bindings: {
    members: '<'
  }
});

function membershipsController() {
  var membershipCtrl = this;
  membershipCtrl.$onInit = function() {
    membershipCtrl.updatedMembers = [];
  };
}
