app.component('membersIndexComponent', {
  templateUrl: 'components/membersIndex/_members.html',
  controller: membersIndexController,
  controllerAs: "membersCtrl",
  bindings: {
    members: '<',
    isUserAdmin: '<'
  }
});

function membersIndexController($state) {
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

  membersCtrl.viewMember = function(member){
    if(!!membersCtrl.isUserAdmin()){
      $state.go('root.admin.memberEdit', {id: member.id});
    } else {
      $state.go('root.memberProfile');
    }
  };
}
