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

  membersCtrl.toggleShowShop = function(member) {
    if(!member.showShops) {
      member.showShops = true;
    } else {
      member.showShops = false;
    }
  };
}
