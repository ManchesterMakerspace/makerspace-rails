app.component('membersIndexComponent', {
  templateUrl: 'components/membersIndex/_members.html',
  controller: membersIndexController,
  controllerAs: "membersCtrl",
  bindings: {
    members: '<'
  }
});

function membersIndexController() {
  var membersCtrl = this;
  membersCtrl.$onInit = function() {
    console.log(membersCtrl.members)
  };
}
