app.component('membersIndexComponent', {
  templateUrl: 'components/membersIndex/_members.html',
  controller: membersIndexController,
  controllerAs: "membersCtrl",
  bindings: {
    members: '<'
  }
});

function membersIndexController($state, Auth) {
  var membersCtrl = this;
  membersCtrl.$onInit = function() {
    membersCtrl.currentUser = Auth.currentUser();
  };

  membersCtrl.toggleShowShop = function(member) {
    if(!member.showShops) {
      member.showShops = true;
    } else {
      member.showShops = false;
    }
  };

  membersCtrl.isUserAdmin = function(){
    return !!membersCtrl.currentUser && membersCtrl.currentUser.role === 'admin';
  };

  membersCtrl.viewMember = function(member){
    if(!!membersCtrl.isUserAdmin()){
      $state.go('root.admin.memberEdit', {id: member.id});
    } else {
      $state.go('root.memberProfile');
    }
  };

  membersCtrl.expStatus = function(date) {
    var today = new Date();
    var week = new Date(today.getTime() + 24*60*60*1000*7);
    if(date <= today){
      return 'danger';
    } else if (date <= week) {
      return 'warning';
    } else {
      return 'success';
    }
  };
}
