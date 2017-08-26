app.component('workshopsComponent', {
  templateUrl: 'components/workshops/_workshops.html',
  controller: workshopsController,
  controllerAs: "workshopsCtrl",
  bindings: {
    currentUser: '<'
  }
});

function workshopsController() {
  var workshopsCtrl = this;
  workshopsCtrl.$onInit = function() {
  };

  workshopsCtrl.isUserAdmin = function(){
    return !!workshopsCtrl.currentUser && workshopsCtrl.currentUser.role === 'admin';
  };
}
