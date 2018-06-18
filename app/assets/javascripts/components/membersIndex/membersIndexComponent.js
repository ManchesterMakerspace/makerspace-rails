app.component('membersIndexComponent', {
  templateUrl: 'components/membersIndex/_members.html',
  controller: membersIndexController,
  controllerAs: "membersCtrl",
  bindings: {
    members: '<',
    currentUser: '<'
  }
});

function membersIndexController($state, memberService) {
  var membersCtrl = this;
  membersCtrl.$onInit = function() {
    membersCtrl.viewAll = false;
    membersCtrl.reverseSort = false;
    membersCtrl.descToggle = "Desc";
    // membersCtrl.currentUser = Auth.currentUser();
  };

  membersCtrl.toggleShowShop = function(member) {
    if(!member.showShops) {
      member.showShops = true;
    } else {
      member.showShops = false;
    }
  };

  membersCtrl.toggleOrder = function(){
    if(membersCtrl.descToggle === 'Desc'){
      membersCtrl.descToggle = 'Asc';
    } else {
      membersCtrl.descToggle = 'Desc';
    }
  };

  membersCtrl.isUserAdmin = function(){
    return !!membersCtrl.currentUser && membersCtrl.currentUser.role === 'admin';
  };

  membersCtrl.viewMember = function(member){
    if(!!membersCtrl.isUserAdmin()){
      $state.go('root.admin.memberEdit', {id: member.id});
    } else {
      return;
      // $state.go('root.memberProfile');
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

  membersCtrl.updateList = function () {
    return memberService.getAllMembers(membersCtrl.searchText).then(function (members) {
      membersCtrl.members = members;
    });
  };
}
