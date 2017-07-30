app.component('rootComponent', {
  templateUrl: 'components/root/_root.html',
  controller: rootController,
  controllerAs: "rootCtrl",
  bindings: {
    currentUser: '<'
  }
});

function rootController() {
  var rootCtrl = this;
  rootCtrl.$onInit = function() {
  };

  rootCtrl.isUserAdmin = function(){
    return !!rootCtrl.currentUser && rootCtrl.currentUser.role === 'admin';
  };
}
